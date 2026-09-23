import type { DailyLog, DutyStatus } from '@/features/trip-results/schema';

const width = 1000;
const gridLeft = 130;
const gridWidth = 760;
const headerTop = 18;
const headerHeight = 36;
const gridTop = 58;
const rowHeight = 44;
const gridBottom = gridTop + rowHeight * 4;
const totalX = 936;
const bracketBottom = gridBottom + 16;
const remarkLabelTop = bracketBottom + 12;
const remarkLabelLaneHeight = 16;
const remarkLabelMinimumGap = 24;
const remarkLabelAngle = 35;
const sheetHeight = 350;
const statusRows: Array<{ status: DutyStatus; label: string[] }> = [
  { status: 'OFF', label: ['1. Off Duty'] },
  { status: 'SB', label: ['2. Sleeper Berth'] },
  { status: 'D', label: ['3. Driving'] },
  { status: 'ON', label: ['4. On Duty', '(not driving)'] },
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

function buildRemarkAnnotations(log: DailyLog) {
  const annotations = log.remarks.map((remark) => {
    const segment = log.segments.find((candidate) => candidate.start_min === remark.at_min);
    const untilMin = segment && segment.status !== 'D' ? segment.end_min : undefined;
    return { ...remark, x: minuteX(remark.at_min), untilMin, showsLabel: true, lane: 0 };
  });
  annotations.forEach((annotation, index) => {
    const previous = annotations[index - 1];
    annotation.showsLabel = !(
      previous?.untilMin === annotation.at_min && previous.location === annotation.location
    );
  });
  const labelled = annotations.filter((annotation) => annotation.showsLabel);
  for (let index = labelled.length - 2; index >= 0; index -= 1) {
    const next = labelled[index + 1];
    labelled[index].lane = next.x - labelled[index].x < remarkLabelMinimumGap ? next.lane + 1 : 0;
  }
  return annotations;
}

function remarkMarkerPath(x: number, untilMin: number | undefined) {
  const stem = `M ${x} ${gridBottom} V ${bracketBottom}`;
  return untilMin === undefined ? stem : `${stem} H ${minuteX(untilMin)} V ${gridBottom}`;
}

function hourLabel(hour: number) {
  if (hour === 12) return 'Noon';
  return String(hour > 12 ? hour - 12 : hour);
}

export function LogGrid({ log }: { log: DailyLog }) {
  const remarkAnnotations = buildRemarkAnnotations(log);
  const total = Object.values(log.totals).reduce((sum, hours) => sum + hours, 0);

  return (
    <svg
      data-testid="log-grid"
      viewBox={`0 0 ${width} ${sheetHeight}`}
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
            <text
              x={6}
              y={y + rowHeight / 2 + 4 - (row.label.length - 1) * 6}
              fontSize={12}
              fontWeight={600}
            >
              {row.label.map((line, lineIndex) => (
                <tspan key={line} x={6} dy={lineIndex === 0 ? 0 : 13}>
                  {lineIndex < row.label.length - 1 ? `${line} ` : line}
                </tspan>
              ))}
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
              {log.totals[row.status]}
            </text>
            <line
              x1={totalX - 22}
              y1={y + rowHeight / 2 + 10}
              x2={totalX + 22}
              y2={y + rowHeight / 2 + 10}
              stroke="currentColor"
            />
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
        data-total-hours-heading
        x={totalX}
        y={33}
        textAnchor="middle"
        fill="currentColor"
        fontSize={10}
        fontWeight={700}
      >
        <tspan x={totalX}>Total</tspan>
        <tspan x={totalX} dy={12}>
          {' Hours'}
        </tspan>
      </text>
      <line
        data-total-sum-rule
        x1={totalX - 22}
        y1={gridBottom + 8}
        x2={totalX + 22}
        y2={gridBottom + 8}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <text
        data-testid="total-sum"
        x={totalX}
        y={gridBottom + 26}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
      >
        {total}
      </text>

      <path
        data-testid="duty-line"
        d={buildDutyPath(log)}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={4}
        strokeLinejoin="miter"
      />

      {remarkAnnotations.map((annotation) => {
        const labelX = annotation.x + 2;
        const labelY = remarkLabelTop + annotation.lane * remarkLabelLaneHeight;
        return (
          <g key={`${annotation.at_min}-${annotation.location}-${annotation.note}`}>
            <path
              data-remark-marker
              data-at-min={annotation.at_min}
              data-until-min={annotation.untilMin}
              d={remarkMarkerPath(annotation.x, annotation.untilMin)}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            {annotation.showsLabel ? (
              <>
                {annotation.lane > 0 ? (
                  <line
                    x1={annotation.x}
                    y1={bracketBottom}
                    x2={annotation.x}
                    y2={labelY - 8}
                    stroke="currentColor"
                    strokeOpacity={0.6}
                  />
                ) : null}
                <text
                  data-remark-label
                  x={labelX}
                  y={labelY}
                  transform={`rotate(${remarkLabelAngle} ${labelX} ${labelY})`}
                  fontSize={10}
                  fontWeight={500}
                >
                  {annotation.location}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
