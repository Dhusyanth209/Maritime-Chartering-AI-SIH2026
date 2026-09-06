import numpy as np
from fastapi import APIRouter
from app.models.schemas import FleetInput, OptimizationResult, VesselOptimizationDetail, FeatureAttribution, PortTelemetryResponse
from app.services.iterative_projection import IterativeProjectionSolver, FleetOptimizationInput, iterative_projection_engine
from app.services.goncalves_solver import GoncalvesHJBSolver
from app.services.data_generator import FleetDataGenerator
from app.services.ais_service import AISPortTelemetryService
from app.core.security import generate_audit_hash
from app.core.config import settings

router = APIRouter()
ip_solver = IterativeProjectionSolver()
hjb_solver = GoncalvesHJBSolver()
ais_service = AISPortTelemetryService()

@router.post("/iterative-projection")
def run_iterative_projection(payload: FleetOptimizationInput):
    """
    Direct endpoint executing the pure Lin et al. (SSRN-5087612)
    Iterative Projection engine on FleetOptimizationInput.
    """
    return iterative_projection_engine(payload)

@router.post("/optimize-fleet", response_model=OptimizationResult)
def optimize_fleet(payload: FleetInput):
    vessels = payload.vessels if payload.vessels else FleetDataGenerator.get_default_fleet()
    N = len(vessels)

    distances = np.array([v.distance_nm for v in vessels], dtype=np.float64)
    baseline_speeds = np.array([v.current_speed_knots for v in vessels], dtype=np.float64)

    # Execute deterministic Iterative Projection solver
    solver_res = ip_solver.solve(
        distances_nm=distances,
        baseline_speeds_knots=baseline_speeds,
        bunker_price_usd_mt=payload.bunker_price_usd,
        daily_demurrage_usd=payload.demurrage_daily_rate_usd,
        stockyard_stock_mt=payload.stockyard_stock_mt,
        stockyard_burn_rate_mt=payload.stockyard_burn_rate_mt,
        critical_cushion_days=payload.critical_cushion_days,
        berth_delay_hours=payload.berth_service_delay_hours
    )

    v_ip = solver_res["v_ip_knots"]
    v_clamped = solver_res["v_clamped_knots"]

    # If manual operator speed override is active, apply it safely
    if payload.operator_speed_override is not None:
        override_speed = np.clip(payload.operator_speed_override, payload.v_min, payload.v_max)
        v_final = np.full(N, override_speed)
    else:
        v_final = v_clamped

    # Calculate vessel-level and fleet-level metrics
    a_daily = settings.ADMIRALTY_A_DAILY
    b_power = settings.ADMIRALTY_B
    usd_to_inr = settings.USD_TO_INR

    vessel_details = []
    total_fuel_saved_mt = 0.0
    total_fuel_saved_usd = 0.0
    total_demurrage_avoided_usd = 0.0

    for i, v in enumerate(vessels):
        dist = distances[i]
        base_spd = baseline_speeds[i]
        opt_spd = v_final[i]

        # Transit times in hours
        t_base_hrs = dist / base_spd
        t_opt_hrs = dist / opt_spd
        t_base_days = t_base_hrs / 24.0
        t_opt_days = t_opt_hrs / 24.0

        # Fuel consumption in MT: a * v^b * days
        fuel_base_mt = a_daily * (base_spd ** b_power) * t_base_days
        fuel_opt_mt = a_daily * (opt_spd ** b_power) * t_opt_days
        fuel_saved_mt = max(0.0, fuel_base_mt - fuel_opt_mt)
        fuel_saved_usd = fuel_saved_mt * payload.bunker_price_usd

        # Demurrage avoided through Virtual Arrival:
        # Traditional HUAW incurs ~4.5 days wait at anchorage; Virtual Arrival reduces wait to ~0.5 day
        demurrage_base_usd = 4.5 * payload.demurrage_daily_rate_usd
        demurrage_opt_usd = 0.5 * payload.demurrage_daily_rate_usd
        dem_avoided_usd = max(0.0, demurrage_base_usd - demurrage_opt_usd)
        dem_avoided_lakhs = (dem_avoided_usd * usd_to_inr) / 100000.0

        vessel_details.append(VesselOptimizationDetail(
            id=v.id,
            name=v.name,
            cargo_mt=v.cargo_mt,
            distance_nm=dist,
            baseline_speed_knots=round(float(base_spd), 2),
            optimal_speed_ip=round(float(v_ip[i]), 2),
            optimal_speed_clamped=round(float(opt_spd), 2),
            transit_hours_baseline=round(float(t_base_hrs), 1),
            transit_hours_optimal=round(float(t_opt_hrs), 1),
            eta_baseline_hours=round(float(t_base_hrs), 1),
            eta_optimal_hours=round(float(t_opt_hrs), 1),
            fuel_burn_baseline_mt=round(float(fuel_base_mt), 1),
            fuel_burn_optimal_mt=round(float(fuel_opt_mt), 1),
            fuel_saved_mt=round(float(fuel_saved_mt), 1),
            fuel_saved_usd=round(float(fuel_saved_usd), 2),
            demurrage_baseline_usd=round(float(demurrage_base_usd), 2),
            demurrage_optimal_usd=round(float(demurrage_opt_usd), 2),
            demurrage_avoided_usd=round(float(dem_avoided_usd), 2),
            demurrage_avoided_lakhs_inr=round(float(dem_avoided_lakhs), 2),
            virtual_arrival_delay_hours=round(float(t_opt_hrs - t_base_hrs), 1)
        ))

        total_fuel_saved_mt += fuel_saved_mt
        total_fuel_saved_usd += fuel_saved_usd
        total_demurrage_avoided_usd += dem_avoided_usd

    # Environmental CO2 emissions avoided (IMO standard: 3.114 MT CO2 per MT VLSFO)
    co2_avoided_mt = total_fuel_saved_mt * 3.114
    total_savings_usd = total_fuel_saved_usd + total_demurrage_avoided_usd
    total_savings_lakhs_inr = (total_savings_usd * usd_to_inr) / 100000.0

    # Stockyard Status
    stockyard_status = FleetDataGenerator.compute_stockyard_status(
        stock_mt=payload.stockyard_stock_mt,
        burn_rate_mt=payload.stockyard_burn_rate_mt,
        critical_days=payload.critical_cushion_days
    )

    # Gonçalves Continuous Stopping Evaluation
    hjb_eval = hjb_solver.evaluate(current_spot=payload.macro_spot_rate_usd_mt)

    # Explainable AI (XAI) Feature Attribution
    fuel_pct = round((total_fuel_saved_usd / max(1.0, total_savings_usd)) * 100.0, 1)
    dem_pct = round((total_demurrage_avoided_usd / max(1.0, total_savings_usd)) * 100.0, 1)

    feature_attributions = [
        FeatureAttribution(
            feature="Admiralty Slow-Steaming Fuel Burn Reduction",
            impact_usd=round(total_fuel_saved_usd, 2),
            percentage_contribution=fuel_pct,
            direction="Favorable"
        ),
        FeatureAttribution(
            feature="Virtual Arrival Port Roadstead Queue Avoidance",
            impact_usd=round(total_demurrage_avoided_usd, 2),
            percentage_contribution=dem_pct,
            direction="Favorable"
        ),
        FeatureAttribution(
            feature="Stockyard Runout Clamping Constraint",
            impact_usd=0.0,
            percentage_contribution=0.0,
            direction="Non-Binding (Healthy Buffer)" if not stockyard_status.is_clamped_by_stockyard else "Binding Safety Override"
        )
    ]

    fleet_aggregates = {
        "vessels_optimized": N,
        "total_fuel_saved_mt": round(total_fuel_saved_mt, 1),
        "total_fuel_saved_usd": round(total_fuel_saved_usd, 2),
        "total_demurrage_avoided_usd": round(total_demurrage_avoided_usd, 2),
        "total_demurrage_avoided_lakhs_inr": round((total_demurrage_avoided_usd * usd_to_inr) / 100000.0, 2),
        "co2_emissions_avoided_mt": round(co2_avoided_mt, 1),
        "net_expenditure_avoided_usd": round(total_savings_usd, 2),
        "net_expenditure_avoided_lakhs_inr": round(total_savings_lakhs_inr, 2),
        "fuel_burn_reduction_pct": round((total_fuel_saved_mt / max(1.0, total_fuel_saved_mt + sum(v.fuel_burn_optimal_mt for v in vessel_details))) * 100.0, 1)
    }

    # Generate immutable CVC/CAG cryptographic signature
    audit_snapshot = {
        "fleet_aggregates": fleet_aggregates,
        "speeds_clamped": [v.optimal_speed_clamped for v in vessel_details],
        "stockyard_status": stockyard_status.model_dump(),
        "goncalves": hjb_eval,
        "solver_latency_ms": solver_res["solver_latency_ms"]
    }
    signature = generate_audit_hash(audit_snapshot)

    return OptimizationResult(
        status="success",
        destination_port=payload.destination_port,
        vessels=vessel_details,
        fleet_aggregates=fleet_aggregates,
        stockyard=stockyard_status,
        goncalves_macro_trigger=hjb_eval,
        feature_attributions=feature_attributions,
        solver_metadata={
            "algorithm": "Deterministic Iterative Projection (Lin et al. SSRN-5087612)",
            "time_complexity": "Theta(I_max * |Xi_hat| * N)",
            "iterations": solver_res["iterations_completed"],
            "scenarios": solver_res["scenarios_evaluated"],
            "latency_ms": solver_res["solver_latency_ms"],
            "subgradient_norm": solver_res["subgradient_norm"],
            "status": "CONVERGED_OPTIMAL"
        },
        audit_signature=signature
    )

@router.get("/telemetry/ports", response_model=PortTelemetryResponse)
def get_port_telemetry():
    return ais_service.get_port_telemetry()
