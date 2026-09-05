import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from typing import Dict, Any, List
from app.core.config import settings

class PortSpatialQueueEstimator:
    """
    AIS Spatial Queue and Dwell Estimator using DBSCAN Clustering.
    Segments anchorage holding zones, pilot channels, and discharging berths
    to compute real-time port congestion indices and demurrage exposure.
    """
    def __init__(self, eps_deg: float = 0.035, min_samples: int = 3):
        self.eps_deg = eps_deg
        self.min_samples = min_samples
        self.daily_demurrage_rate_usd = settings.DEFAULT_DEMURRAGE_RATE_USD
        self.allowed_laytime_days = settings.DEFAULT_ALLOWED_LAYTIME_DAYS
        self.usd_to_inr = settings.USD_TO_INR

    def analyze_port(self, vessels: List[Dict[str, Any]], port_key: str = "paradip") -> Dict[str, Any]:
        if not vessels:
            return {
                "port": port_key,
                "congestion_index": 20.0,
                "anchorage_queue_depth": 0,
                "projected_wait_days": 1.0,
                "projected_total_dwell_days": 3.4,
                "demurrage_risk_usd": 0.0,
                "clusters": []
            }

        df = pd.DataFrame(vessels)
        coords = df[["lat", "lon"]].values

        # DBSCAN clustering on geographic coordinates
        db = DBSCAN(eps=self.eps_deg, min_samples=self.min_samples).fit(coords)
        df["cluster"] = db.labels_

        clusters = []
        for cluster_id in sorted(list(set(db.labels_))):
            sub = df[df["cluster"] == cluster_id]
            avg_speed = float(sub["speed_knots"].mean())
            avg_dwell = float(sub["days_in_anchorage"].mean() * 24.0)

            if cluster_id == -1:
                label = "Approach Channel / Transit"
                zone = "transit"
            elif avg_speed < 0.5 and avg_dwell > 24.0:
                label = "Outer Anchorage Waiting Zone"
                zone = "anchorage"
            elif avg_speed < 0.2:
                label = "Mechanized Coal Discharge Berths"
                zone = "berth"
            else:
                label = f"Maneuvering Fairway {cluster_id}"
                zone = "fairway"

            clusters.append({
                "cluster_id": int(cluster_id),
                "label": label,
                "zone_type": zone,
                "vessel_count": int(len(sub)),
                "avg_speed_knots": round(avg_speed, 2),
                "avg_dwell_hours": round(avg_dwell, 1),
                "center_lat": round(float(sub["lat"].mean()), 4),
                "center_lon": round(float(sub["lon"].mean()), 4)
            })

        # M/M/c Multi-server Queuing Model
        anchorage_vessels = df[(df["speed_knots"] < 0.6) & (df["days_in_anchorage"] > 0.8)]
        queue_depth = len(anchorage_vessels)

        num_berths = 4 if "paradip" in port_key.lower() else 3
        discharge_rate_per_berth_day = 0.42  # ~2.38 days per Capesize discharge
        total_port_throughput = num_berths * discharge_rate_per_berth_day

        projected_wait_days = queue_depth / total_port_throughput
        berthing_discharge_days = 2.4
        total_dwell_days = projected_wait_days + berthing_discharge_days

        # Demurrage Hazard: C_dem * max(0, Dwell - Laytime)
        demurrage_days = max(0.0, total_dwell_days - self.allowed_laytime_days)
        demurrage_risk_usd = demurrage_days * self.daily_demurrage_rate_usd

        # Congestion index 0-100%
        congestion_index = min(100.0, (queue_depth / (num_berths * 4.5)) * 100.0)

        return {
            "port": port_key,
            "port_name": "Paradip Port (Odisha)" if "paradip" in port_key.lower() else "Visakhapatnam Port (Andhra Pradesh)",
            "queue_depth": int(queue_depth),
            "berth_capacity": int(num_berths),
            "congestion_index": round(float(congestion_index), 1),
            "projected_queue_wait_days": round(float(projected_wait_days), 1),
            "projected_total_dwell_days": round(float(total_dwell_days), 1),
            "allowed_laytime_days": self.allowed_laytime_days,
            "demurrage_days": round(float(demurrage_days), 1),
            "demurrage_rate_daily_usd": self.daily_demurrage_rate_usd,
            "demurrage_risk_usd": round(float(demurrage_risk_usd), 2),
            "demurrage_risk_inr_cr": round(float((demurrage_risk_usd * self.usd_to_inr) / 1e7), 2),
            "clusters": clusters,
            "total_vessels_tracked": len(df)
        }
