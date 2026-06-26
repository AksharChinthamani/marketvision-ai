from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="active")
    progress = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User")

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    market_share = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)

class ProjectDetails(Base):
    __tablename__ = "project_details"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    goal = Column(String)
    audience = Column(String)
    budget = Column(String)
    duration = Column(String)
    channels = Column(String) # JSON string
    frugalMode = Column(Boolean)
    language = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")

class StrategyResult(Base):
    __tablename__ = "strategy_results"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(String) # JSON string
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")

class CompetitorAnalysis(Base):
    __tablename__ = "competitor_analysis"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(String) # JSON string
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")

class RoadmapResult(Base):
    __tablename__ = "roadmap_results"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(String) # JSON string
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")

class CreativeAsset(Base):
    __tablename__ = "creative_assets"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(String) # JSON string
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User")
