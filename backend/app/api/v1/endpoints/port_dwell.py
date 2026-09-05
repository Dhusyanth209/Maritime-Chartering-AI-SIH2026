from fastapi import APIRouter, Query
from app.services.ais_pipeline import AISDataPipeline
from app.models.port_dbscan import PortSpatialQueueEstimator

router = APIRouter()
pipeline = AISDataPipeline()
estimator = PortSpatialQueueEstimator()

@router.get("/status")
def get_port_status(
    port: str = Query("paradip", description="Port identifier (paradip or vizag)")
):
    """
    Returns real-time DBSCAN spatial clustering, outer anchorage queue depth,
    projected dwell, and demurrage exposure.
    """
    vessels = pipeline.generate_synthetic_ais(port_name=port)
    analysis = estimator.analyze_port(vessels, port_key=port)
    return {
        "status": "success",
        "port_status": analysis
    }

@router.get("/ais")
def get_port_ais(
    port: str = Query("paradip", description="Port identifier (paradip or vizag)")
):
    """
    Returns AIS vessel telemetry points for spatial radar visualization.
    """
    vessels = pipeline.generate_synthetic_ais(port_name=port)
    return {
        "status": "success",
        "port": port,
        "vessels": vessels
    }
