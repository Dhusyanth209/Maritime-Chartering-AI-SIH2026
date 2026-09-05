import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface RateForecastChartProps {
  horizons: Array<{
    horizon_days: number;
    label: string;
    mean_rate_usd_mt: number;
    lower_90_ci: number;
    upper_90_ci: number;
    confidence_score: number;
    trend: string;
  }>;
  currentSpot: number;
  ensembleWeights?: {
    rnn_weight: number;
    lstm_weight: number;
    gru_weight: number;
  };
  recommendedHorizon?: string;
}

export const RateForecastChart: React.FC<RateForecastChartProps> = ({
  horizons,
  currentSpot,
  ensembleWeights,
  recommendedHorizon = "T+14"
}) => {
  // Build chart dataset bridging from Day 0 (Current Spot) to future horizons
  const chartData = [
    {
      label: "Now (T+0)",
      rate: currentSpot,
      lower: currentSpot,
      upper: currentSpot,
      ciBand: [currentSpot, currentSpot]
    },
    ...horizons.map((h) => ({
      label: h.label,
      rate: h.mean_rate_usd_mt,
      lower: h.lower_90_ci,
      upper: h.upper_90_ci,
      ciBand: [h.lower_90_ci, h.upper_90_ci],
      confidence: `${(h.confidence_score * 100).toFixed(0)}%`,
      trend: h.trend
    }))
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <h3 className="text-base font-bold text-white tracking-wide">
              DERN Multi-Horizon Rate Forecaster
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            PyTorch Deep RNN+LSTM+GRU Ensemble • 4-Head Temporal Attention • 90% Confidence Interval
          </p>
        </div>

        {/* Ensemble Weight Badges */}
        {ensembleWeights && (
          <div className="flex items-center space-x-2 text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-sky-400">RNN: {(ensembleWeights.rnn_weight * 100).toFixed(0)}%</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">LSTM: {(ensembleWeights.lstm_weight * 100).toFixed(0)}%</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400">GRU: {(ensembleWeights.gru_weight * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              domain={["auto", "auto"]}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              unit=" $"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.5rem",
                color: "#f8fafc",
                fontSize: "12px"
              }}
              formatter={(val: any, name: string) => {
                if (name === "rate") return [`$${Number(val).toFixed(2)}/MT`, "Forecast Spot"];
                if (name === "lower") return [`$${Number(val).toFixed(2)}/MT`, "Lower 90% CI"];
                if (name === "upper") return [`$${Number(val).toFixed(2)}/MT`, "Upper 90% CI"];
                return [val, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="url(#ciGradient)"
              name="90% Confidence Envelope"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="#0f172a"
              name="Lower Envelope Mask"
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 4, fill: "#38bdf8" }}
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
              name="Mean Forecast ($/MT)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Horizon Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800">
        {horizons.map((h) => {
          const isOptimal = h.label === recommendedHorizon;
          return (
            <div
              key={h.label}
              className={`p-2.5 rounded-xl border transition-all ${
                isOptimal
                  ? "bg-sky-950/60 border-sky-500 shadow-sm"
                  : "bg-slate-950/50 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">{h.label}</span>
                {isOptimal && (
                  <span className="text-[9px] font-bold uppercase bg-sky-500 text-white px-1.5 py-0.2 rounded">
                    Optimal
                  </span>
                )}
              </div>
              <div className="text-sm font-extrabold text-white mt-1">
                ${h.mean_rate_usd_mt.toFixed(2)}
                <span className="text-[10px] text-slate-400 font-normal"> /MT</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                90% CI: ${h.lower_90_ci.toFixed(1)} - ${h.upper_90_ci.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
