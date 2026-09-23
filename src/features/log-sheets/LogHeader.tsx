import type { DailyLog } from '@/features/trip-results/schema';

import { formatLogDate } from './format';

function LabeledValue({
  label,
  value,
  testId,
}: {
  label: string;
  value: string | number;
  testId?: string;
}) {
  return (
    <div className="border-foreground flex min-h-12 flex-col justify-end border-b pb-1">
      <p data-testid={testId} className="text-sm leading-tight font-semibold">
        {value}
      </p>
      <p className="text-[0.65rem] leading-tight">{label}</p>
    </div>
  );
}

export function LogHeader({ log }: { log: DailyLog }) {
  const { header } = log;

  return (
    <header className="grid gap-4">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Drivers Daily Log</h3>
          <p className="text-xs">(24 hours)</p>
        </div>
        <div className="text-center">
          <p data-testid="log-date" className="border-foreground border-b px-4 pb-1 font-semibold">
            {formatLogDate(log.date)}
          </p>
          <p className="mt-1 text-[0.65rem]">month / day / year</p>
        </div>
        <div className="text-right text-[0.65rem] leading-relaxed">
          <p>Original - File at home terminal.</p>
          <p>Duplicate - Driver retains in his/her possession for 8 days.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LabeledValue label="From" value={header.from} testId="log-from" />
        <LabeledValue label="To" value={header.to} testId="log-to" />
      </div>

      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledValue
            label="Total Miles Driving Today"
            value={header.miles_driving_today}
            testId="log-miles-driving"
          />
          <LabeledValue
            label="Total Mileage Today"
            value={header.total_mileage_today}
            testId="log-total-mileage"
          />
          <div className="sm:col-span-2">
            <LabeledValue
              label="Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)"
              value={`${header.truck_tractor_no} / ${header.trailer_no}`}
              testId="log-vehicle-numbers"
            />
          </div>
        </div>
        <div className="grid gap-1">
          <LabeledValue
            label="Name of Carrier or Carriers"
            value={header.carrier_name}
            testId="log-carrier"
          />
          <LabeledValue
            label="Main Office Address"
            value={header.main_office_address}
            testId="log-main-office"
          />
          <LabeledValue
            label="Home Terminal Address"
            value={header.home_terminal_address}
            testId="log-home-terminal"
          />
        </div>
      </div>
    </header>
  );
}
