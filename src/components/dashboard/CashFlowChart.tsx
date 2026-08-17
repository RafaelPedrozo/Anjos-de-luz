"use client";

import { SlidersHorizontal } from "lucide-react";
import type { CashFlowPoint } from "@/data/dashboard";
import { Card } from "@/components/ui";

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 12, right: 16, bottom: 32, left: 48 };

function scaleX(index: number, count: number) {
  const chartW = WIDTH - PADDING.left - PADDING.right;
  if (count <= 1) return PADDING.left + chartW / 2;
  return PADDING.left + (index / (count - 1)) * chartW;
}

function scaleY(value: number, yMax: number) {
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  return PADDING.top + chartH - (value / yMax) * chartH;
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function niceMax(value: number) {
  if (value <= 0) return 10000;
  const padded = value * 1.2;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  return Math.ceil(padded / magnitude) * magnitude;
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const yMax = niceMax(Math.max(...data.map((d) => d.value), 0));
  const yTicks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax];

  const points = data.map((d, i) => ({
    x: scaleX(i, data.length),
    y: scaleY(d.value, yMax),
  }));

  const linePath = points.length >= 2 ? buildSmoothPath(points) : "";
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath =
    firstPoint && lastPoint && linePath
      ? `${linePath} L ${lastPoint.x} ${scaleY(0, yMax)} L ${firstPoint.x} ${scaleY(0, yMax)} Z`
      : "";

  return (
    <Card className="flex flex-col p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Fluxo de Caixa</h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Últimos 6 meses
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-white/5 px-3.5 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-white/10 hover:text-white"
        >
          <SlidersHorizontal size={15} strokeWidth={1.75} />
          Filtrar
        </button>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">
            Sem dados de fluxo de caixa
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Gráfico de fluxo de caixa dos últimos 6 meses"
          >
            <defs>
              <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E60023" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#E60023" stopOpacity={0} />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = scaleY(tick, yMax);
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={WIDTH - PADDING.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#949494"
                    fontSize={11}
                  >
                    {tick === 0 ? "0" : Math.round(tick).toLocaleString("pt-BR")}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#cashFlowGradient)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#E60023"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {data.map((d, i) => (
              <text
                key={`${d.month}-${i}`}
                x={scaleX(i, data.length)}
                y={HEIGHT - 8}
                textAnchor="middle"
                fill="#949494"
                fontSize={11}
              >
                {d.month}
              </text>
            ))}
          </svg>
        )}
      </div>
    </Card>
  );
}
