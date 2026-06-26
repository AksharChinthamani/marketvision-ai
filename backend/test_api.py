import requests
import json

BASE_URL = "http://localhost:8000/api"

print("Test 10.1 - POST /api/auth/signup")
try:
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": "direct@test.com", "password": "Pass@123"})
    print(res.status_code, res.text)
except Exception as e:
    print("Failed:", e)

print("\nTest 10.2 - POST /api/ai/generate-strategy")
try:
    res = requests.post(f"{BASE_URL}/ai/generate-strategy", json={
      "goal": "Increase sales of budget smartphones in Tier 2 cities",
      "audience": "18-28 year old students and first-time smartphone buyers",
      "budget": 50000,
      "duration": "30 Days",
      "competitor_data": None
    })
    print(res.status_code, res.text[:200])
except Exception as e:
    print("Failed:", e)

print("\nTest 10.3 - POST /api/ai/analyze-competitors")
try:
    res = requests.post(f"{BASE_URL}/ai/analyze-competitors", json={
      "product": "Budget smartphone with 108MP camera priced at Rs 18000 targeting youth",
      "budget": "50000"
    })
    print(res.status_code, res.text[:200])
except Exception as e:
    print("Failed:", e)

print("\nTest 10.4 - POST /api/ai/generate-creative")
try:
    res = requests.post(f"{BASE_URL}/ai/generate-creative", json={
      "product_name": "NovaTech X1",
      "description": "Budget smartphone with 108MP camera, 5000mAh battery at Rs 18,000. Goal: 10,000 units sold. Target: young adults 18-30 in Tier 2 cities."
    })
    print(res.status_code, res.text[:200])
except Exception as e:
    print("Failed:", e)

print("\nTest 10.5 - POST /api/ai/generate-roadmap")
try:
    res = requests.post(f"{BASE_URL}/ai/generate-roadmap", json={
      "campaign_name": "NovaTech X1 Launch",
      "goal": "Sell 10,000 units in 30 days",
      "strategy_data": { "expected_roi": "300%", "platforms": [{"name": "Instagram"}], "phases": [{"title": "Awareness"}] }
    })
    print(res.status_code, res.text[:200])
except Exception as e:
    print("Failed:", e)

print("\nTest 10.6 - POST /api/ai/generate-dashboard-recommendations")
try:
    res = requests.post(f"{BASE_URL}/ai/generate-dashboard-recommendations", json={
      "metrics": [
        { "title": "Active Campaigns", "value": "3", "trend": "+1 this week" },
        { "title": "Conversion Rate", "value": "3.2%", "trend": "+0.4%" }
      ],
      "performance": [
        { "date": "Mon", "reach": 4000, "conversions": 240 },
        { "date": "Tue", "reach": 3000, "conversions": 139 }
      ]
    })
    print(res.status_code, res.text[:200])
except Exception as e:
    print("Failed:", e)
