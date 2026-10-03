import { useState } from "react";
import "./StatusDonutChart.css";

const SEGMENTS = [
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "confirmed", label: "Confirmed", color: "#22c55e" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const SIZE = 160;
const RADIUS = 58;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export default function StatusDonutChart({ appointments }) {
  const [hovered, setHovered] = useState(null);

  const counts = SEGMENTS.map((seg) => appointments.filter((a) => a.status === seg.key).length);
  const total = counts.reduce((sum, c) => sum + c, 0);

  let cumulative = 0;
  const arcs = SEGMENTS.map((seg, i) => {
    const count = counts[i];
    const length = total > 0 ? (count / total) * CIRCUMFERENCE : 0;
    const offset = cumulative;
    cumulative += length;
    return { ...seg, count, length, offset };
  });

  const activeSeg = hovered != null ? arcs[hovered] : null;

  return (
    <div className="status-donut">
      <div className="status-donut__chart">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          {arcs.map((arc, i) =>
            arc.length > 0 ? (
              <circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={hovered === i ? STROKE + 4 : STROKE}
                strokeDasharray={`${Math.max(arc.length - GAP, 0)} ${CIRCUMFERENCE - arc.length + GAP}`}
                strokeDashoffset={CIRCUMFERENCE - arc.offset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                className="status-donut__arc"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
              />
            ) : null
          )}
        </svg>
        <div className="status-donut__center">
          {activeSeg ? (
            <>
              <span className="status-donut__center-value">{activeSeg.count}</span>
              <span className="status-donut__center-label">
                {activeSeg.label} ({total > 0 ? Math.round((activeSeg.count / total) * 100) : 0}%)
              </span>
            </>
          ) : (
            <>
              <span className="status-donut__center-value">{total}</span>
              <span className="status-donut__center-label">Total</span>
            </>
          )}
        </div>
      </div>

      <ul className="status-donut__legend">
        {arcs.map((arc, i) => (
          <li
            key={arc.key}
            className={hovered === i ? "status-donut__legend-item status-donut__legend-item--active" : "status-donut__legend-item"}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="status-donut__dot" style={{ background: arc.color }} aria-hidden="true" />
            <span className="status-donut__legend-label">{arc.label}</span>
            <span className="status-donut__legend-count">{arc.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
