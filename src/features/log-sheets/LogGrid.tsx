import type { DailyLog, DutyStatus } from '@/features/trip-results/schema';

import { formatLogHours } from './format';

const width = 1000;
const gridLeft = 130;
const gridWidth = 760;
const headerTop = 18;
const headerHeight = 36;
const gridTop = 58;
const rowHeight = 44;
const gridBottom = gridTop + rowHeight * 4;
const totalX = 936;
const statusRows: Array<{ status: DutyStatus; label: string }> = [
  { status: 'OFF', label: '1. Off Duty' },
  { status: 'SB', label: '2. Sleeper Berth' },
  { status: 'D', label: '3. Driving' },
  { status: 'ON', label: '4. On Duty' },
];

function minuteX(minutes: number) {
  return gridLeft + (minutes / 1440) * gridWidth;
}

function statusY(status: DutyStatus) {
  return gridTop + (statusRows.findIndex((row) => row.status === status) + 0.5) * rowHeight;
}

function buildDutyPath(log: DailyLog) {
  return log.segments
    .map((segment, index) => {
      const prefix =
        index === 0 ? `M ${minuteX(segment.start_min)} ${statusY(segment.status)}` : '';
      const horizontal = `H ${minuteX(segment.end_min)}`;
      const next = log.segments[index + 1];
      const vertical = next && next.status !== segment.status ? `V ${statusY(next.status)}` : '';
      return [prefix, horizontal, vertical].filter(Boolean).join(' ');
    })
    .join(' ');
}

function hourLabel(hour: number) {
  if (hour === 12) return 'Noon';
  return String(hour > 12 ? hour - 12 : hour);
}

export function LogGrid({ log }: { log: DailyLog }) {
  const total = Object.values(log.totals).reduce((sum, hours) => sum + hours, 0);

  return (
    <svg
      data-testid="log-grid"
      viewBox={`0 0 ${width} 330`}
      role="img"
      aria-labelledby={`log-grid-title-${log.day_number}`}
      className="text-foreground h-auto w-full"
    >
      <title id={`log-grid-title-${log.day_number}`}>Duty status graph for {log.date}</title>

      <rect
        x={gridLeft}
        y={headerTop}
        width={gridWidth}
        height={headerHeight}
        fill="currentColor"
      />
      <text x={gridLeft + 3} y={31} fill="var(--background)" fontSize={7} fontWeight={600}>
        <tspan x={gridLeft + 3}>Mid-</tspan>
        <tspan x={gridLeft + 3} dy={8}>
          night
        </tspan>
      </text>
      <text
        x={gridLeft + gridWidth - 3}
        y={31}
        textAnchor="end"
        fill="var(--background)"
        fontSize={7}
        fontWeight={600}
      >
        <tspan x={gridLeft + gridWidth - 3}>Mid-</tspan>
        <tspan x={gridLeft + gridWidth - 3} dy={8}>
          night
        </tspan>
      </text>
      {Array.from({ length: 23 }, (_, index) => index + 1).map((hour) => {
        const x = minuteX(hour * 60);
        return (
          <text
            key={`hour-${hour}`}
            x={x}
            y={40}
            textAnchor="middle"
            fill="var(--background)"
            fontSize={hour === 12 ? 9 : 10}
            fontWeight={600}
          >
            {hourLabel(hour)}
          </text>
        );
      })}

      {statusRows.map((row, index) => {
        const y = gridTop + index * rowHeight;
        return (
          <g key={row.status}>
            <text x={6} y={y + rowHeight / 2 + 4} fontSize={12} fontWeight={600}>
              {row.label}
            </text>
            <rect
              x={gridLeft}
              y={y}
              width={gridWidth}
              height={rowHeight}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <line
              x1={gridLeft}
              y1={y + rowHeight / 2}
              x2={gridLeft + gridWidth}
              y2={y + rowHeight / 2}
              stroke="currentColor"
              strokeOpacity={0.18}
            />
            <text
              data-testid={`total-${row.status}`}
              x={totalX}
              y={y + rowHeight / 2 + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
            >
              {formatLogHours(log.totals[row.status])}
            </text>
          </g>
        );
      })}

      {Array.from({ length: 97 }, (_, quarter) => {
        const isHour = quarter % 4 === 0;
        const isHalfHour = quarter % 2 === 0;
        const x = minuteX(quarter * 15);
        return (
          <line
            key={`quarter-${quarter}`}
            data-testid="quarter-hour-tick"
            x1={x}
            y1={gridTop}
            x2={x}
            y2={gridBottom}
            stroke="currentColor"
            strokeWidth={isHour ? 1.4 : isHalfHour ? 0.8 : 0.5}
            strokeOpacity={isHour ? 0.8 : 0.35}
          />
        );
      })}

      <text
        x={totalX}
        y={41}
        textAnchor="middle"
        fill="var(--background)"
        fontSize={10}
        fontWeight={700}
      >
        Total Hours
      </text>
      <text
        data-testid="total-sum"
        x={totalX}
        y={gridBottom + 24}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
      >
        {formatLogHours(total)}
      </text>

      <path
        data-testid="duty-line"
        d={buildDutyPath(log)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={4}
        strokeLinejoin="miter"
      />

      {log.remarks.map((remark, index) => {
        const x = minuteX(remark.at_min);
        const labelY = 274 + (index % 3) * 18;
        return (
          <g key={`${remark.at_min}-${remark.note}`}>
            <path
              data-remark-marker
              d={`M ${x} ${gridBottom} V 262 H ${Math.min(x + 10, gridLeft + gridWidth)}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <text
              x={Math.min(x + 5, gridLeft + gridWidth - 10)}
              y={labelY}
              transform={`rotate(-45 ${Math.min(x + 5, gridLeft + gridWidth - 10)} ${labelY})`}
              fontSize={7}
            >
              {remark.location}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
