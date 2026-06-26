from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
import json
import requests
import time
from google import genai
from dotenv import load_dotenv
from datetime import datetime, timedelta
import database, models
from sqlalchemy.orm import Session
from routers.auth import get_current_user

load_dotenv()

router = APIRouter()

current_key_idx = 0

# Quota tracking system
class KeyQuotaTracker:
    def __init__(self):
        self.key_usage = {}  # Format: {key_idx: {"count": int, "reset_time": datetime}}
        self.quota_limit = 10  # Requests per minute per key
        self.switch_threshold = 10  # Switch key at 10 requests
    
    def get_key_usage_count(self, key_idx: int) -> int:
        if key_idx not in self.key_usage:
            self.key_usage[key_idx] = {"count": 0, "reset_time": datetime.now() + timedelta(minutes=1)}
        
        # Reset counter if time window has passed
        if datetime.now() >= self.key_usage[key_idx]["reset_time"]:
            self.key_usage[key_idx] = {"count": 0, "reset_time": datetime.now() + timedelta(minutes=1)}
        
        return self.key_usage[key_idx]["count"]
    
    def increment_usage(self, key_idx: int):
        if key_idx not in self.key_usage:
            self.key_usage[key_idx] = {"count": 0, "reset_time": datetime.now() + timedelta(minutes=1)}
        self.key_usage[key_idx]["count"] += 1
    
    def should_switch_key(self, key_idx: int) -> bool:
        usage = self.get_key_usage_count(key_idx)
        return usage >= self.switch_threshold
    
    def get_key_remaining(self, key_idx: int) -> int:
        usage = self.get_key_usage_count(key_idx)
        return max(0, self.quota_limit - usage)

quota_tracker = KeyQuotaTracker()

def handle_ai_error(e: Exception):
    error_msg = str(e)
    if isinstance(e, ValueError) and "GEMINI_API_KEY" in error_msg:
        raise HTTPException(status_code=500, detail="AI service error: Valid API key is not configured.")
    if "429" in error_msg or "quota" in error_msg.lower():
        raise HTTPException(status_code=429, detail="AI service quota exceeded. Please try again later.")
    if "API_KEY_INVALID" in error_msg or "API key not valid" in error_msg:
        raise HTTPException(status_code=500, detail="AI service configuration error: Invalid API Key.")
    raise HTTPException(status_code=500, detail=f"AI service error: {error_msg}")

def generate_with_retry(prompt: str):
    global current_key_idx
    api_key_env = os.getenv("GEMINI_API_KEY")
    if not api_key_env or api_key_env == "AIzaYourRealGeminiKeyHere":
        raise HTTPException(status_code=500, detail="AI service error: Valid API key is not configured.")
    
    api_keys = [k.strip().strip('"') for k in api_key_env.split(",") if k.strip()]
    attempts = len(api_keys)
    last_error = None
    
    for attempt in range(attempts * 2): # Increase attempts to allow for sleeping and retrying
        # Check if current key is approaching quota limit, if so switch proactively
        original_idx = current_key_idx
        while quota_tracker.should_switch_key(current_key_idx):
            print(f"[Key Rotation] Key {current_key_idx} approaching quota limit ({quota_tracker.get_key_usage_count(current_key_idx)}/{quota_tracker.quota_limit}). Switching to next key.")
            current_key_idx = (current_key_idx + 1) % len(api_keys)
            
            if current_key_idx == original_idx:
                # All keys are exhausted, sleep until the current one resets
                if current_key_idx in quota_tracker.key_usage:
                    reset_time = quota_tracker.key_usage[current_key_idx]["reset_time"]
                    sleep_secs = (reset_time - datetime.now()).total_seconds()
                    if sleep_secs > 0:
                        print(f"[Key Rotation] All keys exhausted. Sleeping for {sleep_secs:.2f} seconds...")
                        time.sleep(sleep_secs)
                break # Now that we slept, the condition will pass on the next API call or loop iteration
        
        key = api_keys[current_key_idx]
        remaining = quota_tracker.get_key_remaining(current_key_idx)
        print(f"[API Request] Attempt {attempt + 1}/{attempts} - Using Key {current_key_idx} (Remaining quota: {remaining})")
        
        try:
            client = genai.Client(api_key=key)
            
            # JSON retry loop
            current_prompt = prompt
            for parse_attempt in range(2):
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=current_prompt
                )
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                try:
                    result = json.loads(text)
                    # Success - increment usage counter
                    quota_tracker.increment_usage(current_key_idx)
                    print(f"[Success] Request completed with Key {current_key_idx}")
                    return result
                except json.JSONDecodeError:
                    if parse_attempt == 0:
                        current_prompt += "\n\nWARNING: The last response was not valid JSON. You MUST respond ONLY with a valid JSON object matching the exact structure. Do NOT include markdown formatting."
                    else:
                        raise ValueError("Failed to parse valid JSON from the model.")
        except Exception as e:
            last_error = e
            error_msg = str(e)
            print(f"[Error] Key {current_key_idx} failed: {error_msg}")
            
            # Check for quota exceeded error - switch immediately
            if "429" in error_msg or "quota" in error_msg.lower():
                print(f"[Quota Exceeded] Key {current_key_idx} hit quota limit. Rotating to next key...")
                quota_tracker.key_usage[current_key_idx]["count"] = quota_tracker.quota_limit
                current_key_idx = (current_key_idx + 1) % len(api_keys)
            elif "JSON" not in error_msg:  # If it's a model/key error, try next key
                current_key_idx = (current_key_idx + 1) % len(api_keys)
            else:
                break  # JSON error means the model worked but output was bad, don't change key just fail
                
    handle_ai_error(last_error)


class StrategyRequest(BaseModel):
    goal: str
    audience: str
    budget: Optional[float] = None
    duration: str
    channels: Optional[list[str]] = None
    frugalMode: Optional[bool] = None
    language: Optional[str] = None
    competitor_data: Optional[dict] = None

class CompetitorRequest(BaseModel):
    product: str
    budget: str

class CreativeRequest(BaseModel):
    product_name: str
    description: str
    strategy_context: Optional[dict] = None

class MetricData(BaseModel):
    title: str
    value: str
    trend: str

class PerformanceData(BaseModel):
    date: str
    reach: int
    conversions: int

class DashboardMetricsRequest(BaseModel):
    metrics: list[MetricData]
    performance: list[PerformanceData]


@router.post("/generate-strategy")
def generate_strategy(request: StrategyRequest, current_user: models.User = Depends(get_current_user)):
    prompt = f"""
    You are an expert marketing strategist. Create a comprehensive marketing strategy based on the following parameters:
    Goal: {request.goal}
    Target Audience: {request.audience}
    Budget: ₹{request.budget if request.budget else 'Not specified'}
    Duration: {request.duration}
    Preferred Channels: {', '.join(request.channels) if request.channels else 'Not specified'}
    Frugal Mode (maximize low budget): {request.frugalMode}
    Primary Language: {request.language if request.language else 'English'}
    """

    if request.competitor_data:
        prompt += f"""
    Additionally, use the following competitor intelligence to shape this strategy. The strategy should specifically outline how to outmaneuver these competitors:
    Competitor Data: {json.dumps(request.competitor_data, indent=2)}
    """

    prompt += """
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or comments outside the JSON:
    {
        "expected_roi": "Percentage string (e.g. '324%')",
        "est_conversion_rate": "Percentage string (e.g. '4.8%')",
        "platforms": [
            {
                "name": "Instagram",
                "icon": "instagram",
                "budget_allocation": "e.g. '30%'",
                "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"]
            },
            {
                "name": "Google Ads",
                "icon": "google",
                "budget_allocation": "e.g. '25%'",
                "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"]
            },
            {
                "name": "Twitter/X",
                "icon": "twitter",
                "budget_allocation": "e.g. '15%'",
                "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"]
            },
            {
                "name": "Offline (Billboards/Print)",
                "icon": "offline",
                "budget_allocation": "e.g. '20%'",
                "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"]
            },
            {
                "name": "YouTube",
                "icon": "youtube",
                "budget_allocation": "e.g. '10%'",
                "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"]
            }
        ],
        "phases": [
            {
                "title": "Phase title string",
                "actions": [
                    {
                        "name": "Action name",
                        "details": "Action description and budget allocation if any"
                    }
                ]
            }
        ]
    }
    Choose the most relevant 4-5 platforms based on the product and goal. Replace all platform examples with the most relevant ones for this specific product and audience. Ensure budget_allocation percentages across all platforms add up to 100%.
    """

    strategy_data = generate_with_retry(prompt)
    return {
        "status": "success",
        "strategy": strategy_data
    }

@router.post("/analyze-competitors")
def analyze_competitors(request: CompetitorRequest, current_user: models.User = Depends(get_current_user)):
    prompt = f"""
    You are an expert market research analyst. Provide a detailed competitive analysis for a company selling the following product, with the specified marketing budget:
    Product/Industry: {request.product}
    Budget: {request.budget}
    
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or comments outside the JSON:
    {{
        "metrics": {{
            "market_share_growth": "Percentage string (e.g. '+11%')",
            "threat_level": "String (e.g. 'Moderate', 'High')",
            "win_rate": "Percentage string (e.g. '68%')"
        }},
        "market_share_trend": [
            {{ "name": "Jan", "You": 24, "Competitor A": 32, "Competitor B": 18 }},
            {{ "name": "Feb", "You": 26, "Competitor A": 30, "Competitor B": 19 }},
            {{ "name": "Mar", "You": 29, "Competitor A": 28, "Competitor B": 20 }},
            {{ "name": "Apr", "You": 33, "Competitor A": 27, "Competitor B": 22 }},
            {{ "name": "May", "You": 35, "Competitor A": 26, "Competitor B": 24 }}
        ],
        "sentiment": [
            {{ "name": "Competitor A", "positive": 45, "neutral": 35, "negative": 20 }},
            {{ "name": "Competitor B", "positive": 60, "neutral": 25, "negative": 15 }}
        ],
        "competitors": [
            {{
                "name": "Competitor Name",
                "description": "Short description of the competitor",
                "strengths": ["Strength 1", "Strength 2"],
                "weaknesses": ["Weakness 1", "Weakness 2"],
                "strategy": "Their estimated marketing strategy and how they might spend a similar budget"
            }}
        ],
        "comparison": {{
            "your_advantage": "2-3 sentence explanation of where the user's strategy has an edge over competitors given their product and budget",
            "competitor_advantage": "2-3 sentence explanation of where the top competitor has an edge and what they do better",
            "recommendation": "Clear 1-sentence actionable recommendation on what the user should do to win"
        }}
    }}
    Replace "Competitor A" and "Competitor B" with actual realistic or real-world competitor names based on the product. Ensure arrays have at least 2 competitors. Make sure the chart data keys match the competitor names exactly. "You" must be literally "You". Ensure market_share_trend spans 5 months.
    """

    analysis_data = generate_with_retry(prompt)
    return {
        "status": "success",
        "data": analysis_data
    }

@router.post("/generate-roadmap")
def generate_roadmap(request: RoadmapRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    prompt = f"""
    You are an expert Project Manager and Marketing Strategist. The user wants to build a campaign roadmap:
    Campaign Name: {request.campaign_name}
    Goal: {request.goal}
    Duration: {request.duration if request.duration else 'Not specified'}
    """

    if request.strategy_data:
        prompt += f"""
    Crucially, this roadmap MUST be built to execute the following approved Marketing Strategy:
    Strategy Details: {json.dumps(request.strategy_data, indent=2)}
    Make sure the 30, 60, and 90-day milestones directly map to executing the phases outlined in this strategy.
    """

    prompt += """
    Generate a structured 30, 60, and 90-day execution roadmap.
    If the campaign duration is shorter than 90 days (e.g., 30 Days), still generate the later phases (60/90 Days) but mark them clearly as "Optional Extension" or "Post-Campaign Analysis" in their focus and explanation.
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or comments outside the JSON:
    {
        "phases": [
            {
                "phase": "30 Days",
                "focus": "Main focus for the first 30 days",
                "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
                "explanation": "A clear explanation of how this phase works in the timeline and builds towards the next."
            },
            {
                "phase": "60 Days",
                "focus": "Main focus for the next 30 days (days 31-60)",
                "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
                "explanation": "A clear explanation of how this phase builds upon the first 30 days."
            },
            {
                "phase": "90 Days",
                "focus": "Main focus for the final 30 days (days 61-90)",
                "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
                "explanation": "A clear explanation of how this phase finalizes the campaign and achieves the ultimate goal."
            }
        ]
    }
    """

    roadmap_data = generate_with_retry(prompt)
    
    # Create Campaign
    new_campaign = models.Campaign(
        title=request.campaign_name,
        status="active",
        progress=0,
        owner_id=current_user.id
    )
    db.add(new_campaign)
    db.commit()

    return {
        "status": "success",
        "data": roadmap_data
    }

@router.post("/generate-creative")
def generate_creative(request: CreativeRequest, current_user: models.User = Depends(get_current_user)):
    prompt = f"""
    You are an expert Creative Director. The user wants to advertise their product/company:
    Product Name: {request.product_name}
    Context/Description: {request.description}
    """

    if request.strategy_context:
        prompt += f"""
    This creative work must align with the following approved marketing strategy. Reference the platforms, 
    budget allocations, and tactics when writing taglines and propositions — make them platform-aware:
    Strategy Context: {json.dumps(request.strategy_context, indent=2)}
    """

    prompt += """
    Generate the following creative assets:
    1. 5 catchy, memorable taglines tailored specifically to this product and audience. If a strategy was provided, make at least 2 taglines platform-specific (e.g. short punchy ones for Instagram/Twitter, longer ones for Google Ads).
    2. 3 strong value proposition statements that clearly communicate the product's benefit and align with the campaign goal.
    3. 3 detailed image generation prompts that could be fed into a text-to-image AI to create compelling marketing images. The image prompts should describe the visual style, subject, lighting, mood, and how the product is presented. Make them highly specific and vivid.
    
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or comments outside the JSON:
    {
        "taglines": ["Tagline 1", "Tagline 2", "Tagline 3", "Tagline 4", "Tagline 5"],
        "statements": ["Statement 1", "Statement 2", "Statement 3"],
        "image_prompts": ["Prompt 1", "Prompt 2", "Prompt 3"]
    }
    """

    creative_data = generate_with_retry(prompt)
    return {
        "status": "success",
        "data": creative_data
    }

@router.post("/generate-dashboard-recommendations")
def generate_dashboard_recommendations(request: DashboardMetricsRequest, current_user: models.User = Depends(get_current_user)):
    metrics_str = json.dumps([m.dict() for m in request.metrics], indent=2)
    performance_str = json.dumps([p.dict() for p in request.performance], indent=2)
    
    prompt = f"""
    You are an expert Marketing Data Analyst. The user is looking at their current advertising campaign dashboard.
    Here are the current high-level metrics:
    {metrics_str}
    
    Here is the performance trend over the last 7 days:
    {performance_str}
    
    Based on this data, provide exactly 2 highly specific, actionable AI recommendations to improve the campaign.
    Each recommendation must have a title and a detailed description that explains why it is recommended and what impact it will have.
    
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or comments outside the JSON:
    {{
        "recommendations": [
            {{
                "title": "Short title of recommendation",
                "description": "Detailed description and reasoning"
            }},
            {{
                "title": "Short title of recommendation 2",
                "description": "Detailed description and reasoning 2"
            }}
        ]
    }}
    """

    rec_data = generate_with_retry(prompt)
    return {
        "status": "success",
        "data": rec_data
    }

@router.get("/proxy-image")
def proxy_image(prompt: str, seed: int = 0, current_user: models.User = Depends(get_current_user)):
    import urllib.parse
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true&seed={seed}"
    try:
        req = requests.get(url, stream=True, timeout=15)
        req.raise_for_status()
        return StreamingResponse(req.iter_content(chunk_size=1024), media_type=req.headers.get("content-type", "image/jpeg"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
