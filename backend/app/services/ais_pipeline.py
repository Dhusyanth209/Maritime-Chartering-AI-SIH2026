import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from app.core.config import settings

class AISDataPipeline:
    """
    Ingestion, simulation, and buffering service for Baltic indices,
    VLSFO bunker fuel rates, and synthetic AIS telemetry at Paradip and Vizag.
    """
    def __init__(self, seed: int = 42):
        self.seed = seed
        np.random.seed(seed)
        self.cached_timeseries = None
        self.cached_ais_data = {}

    def generate_synthetic_timeseries(self, n_days: int = 1825) -> pd.DataFrame:
        """
        Generates 5-year calibrated time series via Ornstein-Uhlenbeck jump-diffusion:
        - Baltic Dry Index (BDI)
        - Baltic Capesize Index (BCI)
        - Singapore 0.5% VLSFO Bunker Fuel Price ($/MT)
        - Route 1: Gladstone (Australia) -> Paradip ($/MT)
        - Route 2: Tanjung Bara (Indonesia) -> Vizag ($/MT)
        """
        if self.cached_timeseries is not None and len(self.cached_timeseries) == n_days:
            return self.cached_timeseries

        end_date = datetime.now()
        start_date = end_date - timedelta(days=n_days)
        dates = pd.date_range(start=start_date, periods=n_days, freq="D")

        # 1. BDI (Mean: 1800, theta: 0.05, sigma: 40.0)
        bdi = np.zeros(n_days)
        bdi[0] = 1850.0
        theta_bdi, mu_bdi, sigma_bdi = 0.04, 1850.0, 45.0
        for t in range(1, n_days):
            jump = 150.0 * np.random.randn() if np.random.rand() < 0.03 else 0.0
            bdi[t] = max(400.0, bdi[t-1] + theta_bdi * (mu_bdi - bdi[t-1]) + sigma_bdi * np.random.randn() + jump)

        # 2. BCI (Correlated with BDI, higher volatility)
        bci = bdi * 1.35 + np.random.normal(0, 180, n_days)
        bci = np.clip(bci, 600.0, 6500.0)

        # 3. Singapore 0.5% VLSFO Bunker Fuel ($/MT)
        vlsfo = np.zeros(n_days)
        vlsfo[0] = settings.VLSFO_BASE_PRICE_USD_PER_MT
        for t in range(1, n_days):
            vlsfo[t] = max(420.0, vlsfo[t-1] + 0.02 * (610.0 - vlsfo[t-1]) + 8.5 * np.random.randn())

        # 4. Spot Freight Rates ($/MT)
        # Gladstone -> Paradip (5,600 NM)
        spot_gladstone_paradip = 11.5 + (bci / 320.0) + (vlsfo * 0.007) + np.random.normal(0, 0.45, n_days)
        # Tanjung Bara -> Vizag (2,900 NM)
        spot_tanjung_vizag = 7.8 + (bci / 460.0) + (vlsfo * 0.0045) + np.random.normal(0, 0.35, n_days)

        df = pd.DataFrame({
            "date": dates,
            "bdi": np.round(bdi, 1),
            "bci": np.round(bci, 1),
            "vlsfo": np.round(vlsfo, 2),
            "spot_gladstone_paradip": np.round(spot_gladstone_paradip, 2),
            "spot_tanjung_vizag": np.round(spot_tanjung_vizag, 2),
        })

        self.cached_timeseries = df
        return df

    def generate_synthetic_ais(self, port_name: str, n_vessels: int = 90) -> List[Dict]:
        """
        Generates realistic AIS vessel coordinates, speeds, statuses around port.
        """
        if port_name in self.cached_ais_data:
            return self.cached_ais_data[port_name]

        center = settings.PARADIP_COORDS if "paradip" in port_name.lower() else settings.VIZAG_COORDS
        vessels = []

        # 1. Outer Anchorage (Queue trap) - ~55% of vessels
        n_anchor = int(n_vessels * 0.55)
        for i in range(n_anchor):
            angle = np.random.uniform(0, 2 * np.pi)
            dist = np.random.uniform(0.025, 0.08)
            lat = center["lat"] + dist * np.sin(angle)
            lon = center["lon"] + dist * np.cos(angle)
            dwt = int(np.random.choice([150000, 160000, 175000, 180000]))
            vessels.append({
                "mmsi": 419000000 + i,
                "name": f"MV Bulk Titan {i+1}",
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "speed_knots": round(np.random.uniform(0.0, 0.3), 1),
                "heading": int(np.random.uniform(0, 360)),
                "dwt": dwt,
                "status": "Anchored / Awaiting Berth",
                "days_in_anchorage": round(np.random.uniform(1.5, 9.5), 1),
                "cargo_mt": int(dwt * 0.92)
            })

        # 2. Mechanized Coal Berths - ~25% of vessels
        n_berth = int(n_vessels * 0.25)
        for i in range(n_berth):
            dist = np.random.uniform(0.002, 0.012)
            lat = center["lat"] + dist * np.random.uniform(-0.5, 0.5)
            lon = center["lon"] + dist * np.random.uniform(-0.5, 0.5)
            dwt = int(np.random.choice([120000, 150000, 180000]))
            vessels.append({
                "mmsi": 419000500 + i,
                "name": f"MV Ocean Carrier {i+1}",
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "speed_knots": 0.0,
                "heading": int(np.random.choice([45, 135, 225, 315])),
                "dwt": dwt,
                "status": "At Berth / Discharging",
                "days_in_anchorage": round(np.random.uniform(0.5, 2.0), 1),
                "cargo_mt": int(dwt * 0.95)
            })

        # 3. Fairway Channel Transit - ~20% of vessels
        n_transit = n_vessels - n_anchor - n_berth
        for i in range(n_transit):
            dist = np.random.uniform(0.09, 0.16)
            lat = center["lat"] + dist * np.sin(i)
            lon = center["lon"] + dist * np.cos(i)
            vessels.append({
                "mmsi": 419000800 + i,
                "name": f"MV Maritime Runner {i+1}",
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "speed_knots": round(np.random.uniform(8.5, 13.5), 1),
                "heading": int(np.random.uniform(0, 360)),
                "dwt": 150000,
                "status": "Underway / In Transit",
                "days_in_anchorage": 0.0,
                "cargo_mt": 140000
            })

        self.cached_ais_data[port_name] = vessels
        return vessels

pipeline_service = AISDataPipeline()
