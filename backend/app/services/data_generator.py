from typing import List, Dict, Any
from app.models.schemas import VesselInput, StockyardStatusResponse
from app.core.config import settings

class FleetDataGenerator:
    @staticmethod
    def get_default_fleet() -> List[VesselInput]:
        return [
            VesselInput(
                id="MV-SAIL-01",
                name="MV Bharat Pride",
                dwt_mt=180000.0,
                cargo_mt=160000.0,
                origin="Gladstone (Australia)",
                destination_port="paradip",
                distance_nm=5600.0,
                current_speed_knots=14.5
            ),
            VesselInput(
                id="MV-RINL-02",
                name="MV Vizag Pioneer",
                dwt_mt=175000.0,
                cargo_mt=155000.0,
                origin="Hay Point (Australia)",
                destination_port="vizag",
                distance_nm=5450.0,
                current_speed_knots=14.5
            ),
            VesselInput(
                id="MV-SAIL-03",
                name="MV Kalinga Sentinel",
                dwt_mt=160000.0,
                cargo_mt=150000.0,
                origin="Tanjung Bara (Indonesia)",
                destination_port="dhamra",
                distance_nm=2900.0,
                current_speed_knots=14.5
            )
        ]

    @staticmethod
    def compute_stockyard_status(
        stock_mt: float = 350000.0,
        burn_rate_mt: float = 8000.0,
        critical_days: float = 15.0
    ) -> StockyardStatusResponse:
        buffer_days = round(stock_mt / max(100.0, burn_rate_mt), 2)
        net_cushion_days = round(buffer_days - critical_days, 2)
        slack_hours = round(max(0.0, net_cushion_days * 24.0), 1)
        is_clamped = net_cushion_days <= 0.0

        if is_clamped:
            status_label = "CRITICAL REDLINE: Plant Stock Depleted - Forced Velocity Max"
            status_level = "critical"
        elif net_cushion_days <= 5.0:
            status_label = "WARNING BUFFER: Approaching Minimum Safety Cushion"
            status_level = "warning"
        else:
            status_label = "HEALTHY CUSHION: JIT Speed Optimization Enabled"
            status_level = "optimal"

        return StockyardStatusResponse(
            plant_name="SAIL & RINL Integrated Coastal Steel Plants",
            current_stock_mt=stock_mt,
            daily_burn_rate_mt=burn_rate_mt,
            current_buffer_days=buffer_days,
            critical_cushion_days=critical_days,
            net_cushion_days=net_cushion_days,
            slack_hours=slack_hours,
            is_clamped_by_stockyard=is_clamped,
            status_label=status_label,
            status_level=status_level
        )
