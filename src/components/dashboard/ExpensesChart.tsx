import type { ExpenseCategory } from "@/data/dashboard";
import { Card } from "@/components/ui";

const SIZE = 180;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 78;
const INNER_R = 52;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

interface ExpensesChartProps {
  categories: ExpenseCategory[];
}

export function ExpensesChart({ categories }: ExpensesChartProps) {
  const total = categories.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const gap = 2;

  const slices =
    total > 0
      ? categories.map((item) => {
          const sliceAngle = (item.value / total) * 360 - gap;
          const start = currentAngle + gap / 2;
          const end = start + Math.max(sliceAngle, 0);
          currentAngle += (item.value / total) * 360;

          return {
            ...item,
            path: describeArc(CX, CY, OUTER_R, INNER_R, start, end),
          };
        })
      : [];

  return (
    <Card className="flex flex-col p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Despesas</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Por categoria
        </p>
      </div>

      <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center">
        {slices.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Sem despesas</p>
        ) : (
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-label="Gráfico de despesas por categoria"
          >
            {slices.map((slice) => (
              <path key={slice.name} d={slice.path} fill={slice.color} />
            ))}
          </svg>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {categories.length === 0 ? (
          <li className="text-sm text-[var(--color-text-secondary)]">
            Nenhuma despesa neste mês
          </li>
        ) : (
          categories.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-sm text-[var(--color-text-secondary)]">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 text-sm font-medium text-white">
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
