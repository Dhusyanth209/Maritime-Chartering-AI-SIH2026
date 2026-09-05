from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.router import api_router
from app.services.ais_pipeline import AISDataPipeline
from app.models.dern_forecaster import DERNForecaster

pipeline = AISDataPipeline()
forecaster = DERNForecaster()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-train / calibrate models on historical dataset at startup for sub-millisecond inference
    print("Pre-calibrating DERN PyTorch multi-horizon models...")
    df_history = pipeline.generate_synthetic_timeseries(n_days=365)
    forecaster.train_or_calibrate(df_history, target_col="spot_gladstone_paradip", epochs=5)
    print("PAD-CE Backend Engine initialized successfully.")
    yield
    print("PAD-CE Backend Engine shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Port-Aware Dynamic Chartering Engine (PAD-CE) for the Ministry of Steel (SIH 2026)",
    lifespan=lifespan
)

# CORS middleware for local frontend and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "engine": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ministry": "Ministry of Steel (Government of India)",
        "problem_statement": "SIH26006",
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pad-ce-backend",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
