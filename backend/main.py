from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, dashboard, ai, project

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MarketVision AI API", description="Backend for MarketVision AI", version="1.0.0")

import os

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI & Strategy"])
app.include_router(project.router, prefix="/api/project", tags=["Project"])

@app.get("/")
def read_root():
    return {"message": "Welcome to MarketVision AI API. Go to /docs for the swagger UI."}
