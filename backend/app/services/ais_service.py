import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.core.config import settings

class AISPortTelemetryService:
    """
    Simulates high-precision AIS spatial roadsteads, DBSCAN anchorage clusters,
    and fairway channels for Paradip, Visakhapatnam, and Dhamra Ports.
    """
    def __init__(self):
        self.ports_meta = settings.PORTS

    def get_port_telemetry(self) -> Dict[str, Any]:
        timestamp_utc = datetime.now(timezone.utc).isoformat()
        ports_data = {}

        # 1. PARADIP PORT (Odisha)
        # Deepwater mechanized coal discharging port for SAIL Rourkela / Bhilai
        paradip_center = [settings.PORTS["paradip"]["lat"], settings.PORTS["paradip"]["lon"]]
        ports_data["paradip"] = {
            "port_key": "paradip",
            "name": settings.PORTS["paradip"]["name"],
            "latitude": paradip_center[0],
            "longitude": paradip_center[1],
            "berths": 4,
            "queue_depth_vessels": 7,
            "avg_anchorage_wait_hours": 74.5,  # ~3.1 days
            "congestion_index_pct": 58.0,
            "demurrage_hazard_hourly_usd": 7 * settings.HOURLY_DEMURRAGE_USD,
            "roadstead_polygon": [
                [20.240, 86.670],
                [20.290, 86.670],
                [20.310, 86.740],
                [20.260, 86.760],
                [20.240, 86.670]
            ],
            "approach_channel": [
                [20.264, 86.680],
                [20.250, 86.710],
                [20.230, 86.750]
            ],
            "berth_locations": [
                {"berth_id": "CQ-1", "type": "Mechanized Coal", "status": "OCCUPIED", "eta_clear_hrs": 14.0},
                {"berth_id": "CQ-2", "type": "Mechanized Coal", "status": "OCCUPIED", "eta_clear_hrs": 28.5},
                {"berth_id": "CQ-3", "type": "Bulk Berth", "status": "OCCUPIED", "eta_clear_hrs": 42.0},
                {"berth_id": "CQ-4", "type": "Bulk Berth", "status": "RESERVED_PAD_CE", "eta_clear_hrs": 52.0}
            ]
        }

        # 2. VISAKHAPATNAM (VIZAG) PORT (Andhra Pradesh)
        # Dedicated outer harbor coal berth for RINL Vizag Steel Plant
        vizag_center = [settings.PORTS["vizag"]["lat"], settings.PORTS["vizag"]["lon"]]
        ports_data["vizag"] = {
            "port_key": "vizag",
            "name": settings.PORTS["vizag"]["name"],
            "latitude": vizag_center[0],
            "longitude": vizag_center[1],
            "berths": 3,
            "queue_depth_vessels": 4,
            "avg_anchorage_wait_hours": 46.0,  # ~1.9 days
            "congestion_index_pct": 42.0,
            "demurrage_hazard_hourly_usd": 4 * settings.HOURLY_DEMURRAGE_USD,
            "roadstead_polygon": [
                [17.660, 83.280],
                [17.710, 83.290],
                [17.720, 83.350],
                [17.670, 83.360],
                [17.660, 83.280]
            ],
            "approach_channel": [
                [17.686, 83.298],
                [17.680, 83.320],
                [17.670, 83.345]
            ],
            "berth_locations": [
                {"berth_id": "OB-1", "type": "Outer Coal Berth", "status": "OCCUPIED", "eta_clear_hrs": 18.0},
                {"berth_id": "OB-2", "type": "Outer Coal Berth", "status": "OCCUPIED", "eta_clear_hrs": 36.0},
                {"berth_id": "WQ-1", "type": "Multipurpose Bulk", "status": "OPEN", "eta_clear_hrs": 0.0}
            ]
        }

        # 3. DHAMRA PORT (Odisha)
        # Ultra-deepwater private/PSU concession port for Bokaro & Durgapur
        dhamra_center = [settings.PORTS["dhamra"]["lat"], settings.PORTS["dhamra"]["lon"]]
        ports_data["dhamra"] = {
            "port_key": "dhamra",
            "name": settings.PORTS["dhamra"]["name"],
            "latitude": dhamra_center[0],
            "longitude": dhamra_center[1],
            "berths": 2,
            "queue_depth_vessels": 2,
            "avg_anchorage_wait_hours": 22.0,  # ~0.9 days
            "congestion_index_pct": 25.0,
            "demurrage_hazard_hourly_usd": 2 * settings.HOURLY_DEMURRAGE_USD,
            "roadstead_polygon": [
                [20.780, 86.940],
                [20.830, 86.950],
                [20.840, 87.010],
                [20.790, 87.020],
                [20.780, 86.940]
            ],
            "approach_channel": [
                [20.814, 86.963],
                [20.800, 86.985],
                [20.785, 87.015]
            ],
            "berth_locations": [
                {"berth_id": "DP-1", "type": "Capesize Discharge", "status": "OCCUPIED", "eta_clear_hrs": 20.0},
                {"berth_id": "DP-2", "type": "Capesize Discharge", "status": "OPEN", "eta_clear_hrs": 0.0}
            ]
        }

        return {
            "timestamp_utc": timestamp_utc,
            "ports": ports_data
        }
