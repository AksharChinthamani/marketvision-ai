from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Any
import json
import database, models
from routers.auth import get_current_user

router = APIRouter()

class ProjectState(BaseModel):
    projectDetails: Optional[dict] = None
    strategyData: Optional[Any] = None
    competitorData: Optional[Any] = None
    roadmapData: Optional[Any] = None
    creativeData: Optional[Any] = None

@router.get("/state")
def get_project_state(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # Fetch latest for each table
    pd = db.query(models.ProjectDetails).filter(models.ProjectDetails.owner_id == current_user.id).order_by(models.ProjectDetails.id.desc()).first()
    strat = db.query(models.StrategyResult).filter(models.StrategyResult.owner_id == current_user.id).order_by(models.StrategyResult.id.desc()).first()
    comp = db.query(models.CompetitorAnalysis).filter(models.CompetitorAnalysis.owner_id == current_user.id).order_by(models.CompetitorAnalysis.id.desc()).first()
    road = db.query(models.RoadmapResult).filter(models.RoadmapResult.owner_id == current_user.id).order_by(models.RoadmapResult.id.desc()).first()
    creative = db.query(models.CreativeAsset).filter(models.CreativeAsset.owner_id == current_user.id).order_by(models.CreativeAsset.id.desc()).first()
    
    return {
        "projectDetails": {
            "name": pd.name,
            "description": pd.description,
            "goal": pd.goal,
            "audience": pd.audience,
            "budget": pd.budget,
            "duration": pd.duration,
            "channels": json.loads(pd.channels) if pd.channels else [],
            "frugalMode": pd.frugalMode,
            "language": pd.language
        } if pd else None,
        "strategyData": json.loads(strat.data) if strat else None,
        "competitorData": json.loads(comp.data) if comp else None,
        "roadmapData": json.loads(road.data) if road else None,
        "creativeData": json.loads(creative.data) if creative else None
    }

@router.post("/update_state")
def update_project_state(state: ProjectState, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if state.projectDetails is not None:
        pd = models.ProjectDetails(
            name=state.projectDetails.get("name"),
            description=state.projectDetails.get("description"),
            goal=state.projectDetails.get("goal"),
            audience=state.projectDetails.get("audience"),
            budget=state.projectDetails.get("budget"),
            duration=state.projectDetails.get("duration"),
            channels=json.dumps(state.projectDetails.get("channels", [])),
            frugalMode=state.projectDetails.get("frugalMode"),
            language=state.projectDetails.get("language"),
            owner_id=current_user.id
        )
        db.add(pd)
        
    if state.strategyData is not None:
        db.add(models.StrategyResult(data=json.dumps(state.strategyData), owner_id=current_user.id))
        
    if state.competitorData is not None:
        db.add(models.CompetitorAnalysis(data=json.dumps(state.competitorData), owner_id=current_user.id))
        
    if state.roadmapData is not None:
        db.add(models.RoadmapResult(data=json.dumps(state.roadmapData), owner_id=current_user.id))
        
    if state.creativeData is not None:
        db.add(models.CreativeAsset(data=json.dumps(state.creativeData), owner_id=current_user.id))
        
    db.commit()
    return {"status": "success"}
