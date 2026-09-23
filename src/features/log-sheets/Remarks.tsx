import type { DailyLog } from '@/features/trip-results/schema';

import { formatLogMinutes } from './format';

export function Remarks({ log }: { log: DailyLog }) {
  return (
    <section className="border-foreground grid gap-4 border-t pt-3 sm:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)]">
      <div>
        <h4 className="text-sm font-bold">Remarks</h4>
        <ol className="mt-2 grid gap-x-5 gap-y-1 sm:grid-cols-2">
          {log.remarks.map((remark) => (
            <li
              key={`${remark.at_min}-${remark.location}-${remark.note}`}
              data-testid="remark-item"
              className="border-foreground/40 grid grid-cols-[3.2rem_1fr] gap-2 border-b border-dotted py-1 text-xs"
            >
              <time dateTime={formatLogMinutes(remark.at_min)} className="font-mono font-semibold">
                {formatLogMinutes(remark.at_min)}
              </time>
              <span>
                <strong>{remark.location}</strong>
                {remark.note ? ` — ${remark.note}` : null}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div data-testid="log-shipping-doc" className="border-foreground border-l-2 pl-3 text-xs">
        <h4 className="font-bold">Shipping Documents</h4>
        <p className="border-foreground mt-3 border-b pb-1 font-semibold">
          {log.header.shipping_doc_no}
        </p>
        <p className="text-[0.65rem]">DVL or Manifest No.</p>
        <p className="border-foreground mt-3 border-b pb-1 font-semibold">
          {log.header.shipper_commodity}
        </p>
        <p className="text-[0.65rem]">Shipper &amp; Commodity</p>
      </div>
    </section>
  );
}
