from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

import database, models
from routers.auth import get_current_user

router = APIRouter()

class ProjectDetailsCreate(BaseModel):
    name: str
    description: str
    goal: str
    audience: str
    budget: str
    duration: str
    channels: Optional[list[str]] = None
    frugalMode: Optional[bool] = None
    language: Optional[str] = None

class JsonDataCreate(BaseModel):
    data: dict

@router.get("/project")
def get_project(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.owner_id == current_user.id).first()
    if not project:
        return {"status": "not_found", "data": None}
    
    return {
        "status": "success",
        "data": {
            "name": project.name,
            "description": project.description,
            "goal": project.goal,
            "audience": project.audience,
            "budget": project.budget,
            "duration": project.duration,
            "channels": json.loads(project.channels) if project.channels else None,
            "frugalMode": project.frugalMode,
            "language": project.language,
        }
    }

@router.post("/project")
def save_project(details: ProjectDetailsCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.ProjectDetails).filter(models.ProjectDetails.owner_id == current_user.id).first()
    if not project:
        project = models.ProjectDetails(owner_id=current_user.id)
        db.add(project)
    
    project.name = details.name
    project.description = details.description
    project.goal = details.goal
    project.audience = details.audience
    project.budget = details.budget
    project.duration = details.duration
    project.channels = json.dumps(details.channels) if details.channels else None
    project.frugalMode = details.frugalMode
    project.language = details.language
    
    db.commit()
    return {"status": "success"}

# Helper to generate CRUD for JSON data
def create_json_endpoints(path_name: str, model_class):
    @router.get(f"/{path_name}")
    def get_data(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
        record = db.query(model_class).filter(model_class.owner_id == current_user.id).first()
        if not record or not record.data:
            return {"status": "not_found", "data": None}
        return {"status": "success", "data": json.loads(record.data)}

    @router.post(f"/{path_name}")
    def save_data(request: JsonDataCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
        record = db.query(model_class).filter(model_class.owner_id == current_user.id).first()
        if not record:
            record = model_class(owner_id=current_user.id)
            db.add(record)
        record.data = json.dumps(request.data)
        db.commit()
        return {"status": "success"}

create_json_endpoints("strategy", models.StrategyResult)
create_json_endpoints("competitor", models.CompetitorAnalysis)
create_json_endpoints("roadmap", models.RoadmapResult)
create_json_endpoints("creative", models.CreativeAsset)
