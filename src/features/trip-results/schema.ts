import { z } from 'zod';

const locationSchema = z.object({
  label: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const logMetaSchema = z.object({
  driver_name: z.string(),
  co_driver_name: z.string(),
  carrier_name: z.string(),
  main_office_address: z.string(),
  home_terminal_address: z.string(),
  truck_tractor_no: z.string(),
  trailer_no: z.string(),
  shipping_doc_no: z.string(),
  shipper_commodity: z.string(),
});

const dutyStatusSchema = z.enum(['OFF', 'SB', 'D', 'ON']);

const dailyLogSchema = z.object({
  day_number: z.number().int().positive(),
  date: z.string(),
  header: z.object({
    from: z.string(),
    to: z.string(),
    miles_driving_today: z.number(),
    total_mileage_today: z.number(),
    carrier_name: z.string(),
    main_office_address: z.string(),
    home_terminal_address: z.string(),
    truck_tractor_no: z.string(),
    trailer_no: z.string(),
    shipping_doc_no: z.string(),
    shipper_commodity: z.string(),
  }),
  segments: z.array(
    z.object({
      status: dutyStatusSchema,
      start_min: z.number().min(0).max(1440),
      end_min: z.number().min(0).max(1440),
      note: z.string().optional(),
    }),
  ),
  totals: z.object({
    OFF: z.number(),
    SB: z.number(),
    D: z.number(),
    ON: z.number(),
  }),
  remarks: z.array(
    z.object({
      at_min: z.number().min(0).max(1440),
      location: z.string(),
      note: z.string(),
    }),
  ),
  recap: z.object({
    on_duty_today: z.number(),
    a_last_7: z.number(),
    b_available_tomorrow: z.number(),
    c_last_5: z.number(),
    restart_34_taken: z.boolean(),
  }),
});

export const tripPlanSchema = z.object({
  id: z.string(),
  inputs: z.object({
    current: locationSchema,
    pickup: locationSchema,
    dropoff: locationSchema,
    cycle_used_hrs: z.number(),
    start_time: z.string(),
    home_timezone: z.string(),
    include_inspections: z.boolean(),
    log_meta: logMetaSchema,
  }),
  summary: z.object({
    total_miles: z.number(),
    total_driving_hrs: z.number(),
    total_on_duty_hrs: z.number(),
    start_at: z.string(),
    arrive_at: z.string(),
    end_at: z.string(),
    log_days: z.number().int(),
    stop_count: z.number().int(),
    cycle_used_end_hrs: z.number(),
    home_timezone: z.string(),
  }),
  route: z.object({
    geometry: z.object({
      type: z.literal('LineString'),
      coordinates: z.array(z.tuple([z.number(), z.number()])),
    }),
    legs: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        distance_mi: z.number(),
        duration_hrs: z.number(),
      }),
    ),
  }),
  stops: z.array(
    z.object({
      seq: z.number().int().positive(),
      type: z.enum(['pickup', 'fuel', 'break_30', 'rest_10', 'restart_34', 'dropoff']),
      label: z.string(),
      lat: z.number(),
      lng: z.number(),
      mile_marker: z.number(),
      arrive_at: z.string(),
      depart_at: z.string(),
      duration_min: z.number(),
      status: dutyStatusSchema,
    }),
  ),
  daily_logs: z.array(dailyLogSchema),
});

export type TripPlan = z.infer<typeof tripPlanSchema>;
export type TripStop = TripPlan['stops'][number];
export type DailyLog = TripPlan['daily_logs'][number];
export type DutyStatus = z.infer<typeof dutyStatusSchema>;
