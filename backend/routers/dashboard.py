from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import database, models
from routers.auth import get_current_user
router = APIRouter()

class CampaignBase(BaseModel):
    id: int
    title: str
    status: str
    progress: int

    class Config:
        from_attributes = True

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # Mock metrics data that could later be calculated from DB
    return {
        "active_campaigns": db.query(models.Campaign).filter(models.Campaign.status == "active").count() or 3,
        "total_reach": "124.5K",
        "conversion_rate": "3.2%",
        "avg_cpc": "₹14.50"
    }

@router.get("/campaigns", response_model=List[CampaignBase])
def get_campaigns(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    campaigns = db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).all()
    # If no campaigns exist, return some mock data
    if not campaigns:
        return [
            {"id": 1, "title": "Q3 Product Launch", "status": "active", "progress": 65},
            {"id": 2, "title": "Retargeting Flow Optimization", "status": "active", "progress": 40}
        ]
    return campaigns

class CampaignCreate(BaseModel):
    title: str
    status: str = "active"
    progress: int = 0

@router.post("/campaigns", response_model=CampaignBase)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    new_campaign = models.Campaign(
        title=campaign.title,
        status=campaign.status,
        progress=campaign.progress,
        owner_id=current_user.id
    )
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign
