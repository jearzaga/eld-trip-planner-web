export interface paths {
    "/api/geocode/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["geocode_search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["health_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/trips/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["trips_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/trips/{trip_id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["trips_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        DailyLog: {
            day_number: number;
            date: string;
            header: components["schemas"]["LogHeader"];
            segments: components["schemas"]["DutySegment"][];
            totals: components["schemas"]["DutyTotals"];
            remarks: components["schemas"]["Remark"][];
            recap: components["schemas"]["Recap"];
        };
        DutySegment: {
            status: components["schemas"]["DutyStatusEnum"];
            start_min: number;
            end_min: number;
            note: string | null;
            location: string | null;
        };
        /**
         * @description * `OFF` - OFF
         *     * `SB` - SB
         *     * `D` - D
         *     * `ON` - ON
         * @enum {string}
         */
        DutyStatusEnum: "OFF" | "SB" | "D" | "ON";
        DutyTotals: {
            /** Format: double */
            OFF: number;
            /** Format: double */
            SB: number;
            /** Format: double */
            D: number;
            /** Format: double */
            ON: number;
        };
        ErrorDetail: {
            code: string;
            message: string;
            fields: {
                [key: string]: string[];
            };
        };
        ErrorResponse: {
            error: components["schemas"]["ErrorDetail"];
        };
        GeocodeResult: {
            label: string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
        };
        HealthResponse: {
            status: components["schemas"]["HealthStatusEnum"];
        };
        /**
         * @description * `ok` - ok
         *     * `unavailable` - unavailable
         * @enum {string}
         */
        HealthStatusEnum: "ok" | "unavailable";
        Location: {
            label: string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
        };
        LogHeader: {
            /** Format: double */
            miles_driving_today: number;
            /** Format: double */
            total_mileage_today: number;
            driver_name: string;
            co_driver_name: string;
            carrier_name: string;
            main_office_address: string;
            home_terminal_address: string;
            truck_tractor_no: string;
            trailer_no: string;
            shipping_doc_no: string;
            shipper_commodity: string;
            from: string;
            to: string;
        };
        LogMeta: {
            driver_name?: string;
            co_driver_name?: string;
            carrier_name?: string;
            main_office_address?: string;
            home_terminal_address?: string;
            truck_tractor_no?: string;
            trailer_no?: string;
            shipping_doc_no?: string;
            shipper_commodity?: string;
        };
        Recap: {
            /** Format: double */
            on_duty_today: number;
            /** Format: double */
            a_last_7: number;
            /** Format: double */
            b_available_tomorrow: number;
            /** Format: double */
            c_last_5: number;
            restart_34_taken: boolean;
        };
        Remark: {
            at_min: number;
            location: string | null;
            note: string | null;
        };
        Route: {
            geometry: components["schemas"]["RouteGeometry"];
            legs: components["schemas"]["RouteLeg"][];
        };
        RouteGeometry: {
            type: string;
            coordinates: number[][];
        };
        RouteLeg: {
            /** Format: double */
            distance_mi: number;
            /** Format: double */
            duration_hrs: number;
            from: string;
            to: string;
        };
        Stop: {
            seq: number;
            type: components["schemas"]["StopTypeEnum"];
            label: string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            /** Format: double */
            mile_marker: number;
            arrive_at: string;
            depart_at: string;
            duration_min: number;
            status: components["schemas"]["DutyStatusEnum"];
        };
        /**
         * @description * `pickup` - pickup
         *     * `fuel` - fuel
         *     * `break_30` - break_30
         *     * `rest_10` - rest_10
         *     * `restart_34` - restart_34
         *     * `dropoff` - dropoff
         * @enum {string}
         */
        StopTypeEnum: "pickup" | "fuel" | "break_30" | "rest_10" | "restart_34" | "dropoff";
        TripInputs: {
            current: components["schemas"]["Location"];
            pickup: components["schemas"]["Location"];
            dropoff: components["schemas"]["Location"];
            /** Format: double */
            cycle_used_hrs: number;
            start_time: string;
            home_timezone: string;
            include_inspections: boolean;
            log_meta: components["schemas"]["LogMeta"];
        };
        TripRequest: {
            current: components["schemas"]["Location"];
            pickup: components["schemas"]["Location"];
            dropoff: components["schemas"]["Location"];
            /** Format: double */
            cycle_used_hrs: number;
            start_time?: string | null;
            home_timezone?: string | null;
            include_inspections?: boolean;
            log_meta?: components["schemas"]["LogMeta"];
        };
        TripResponse: {
            id: string;
            inputs: components["schemas"]["TripInputs"];
            summary: components["schemas"]["TripSummary"];
            route: components["schemas"]["Route"];
            stops: components["schemas"]["Stop"][];
            daily_logs: components["schemas"]["DailyLog"][];
        };
        TripSummary: {
            /** Format: double */
            total_miles: number;
            /** Format: double */
            total_driving_hrs: number;
            /** Format: double */
            total_on_duty_hrs: number;
            start_at: string;
            arrive_at: string;
            end_at: string;
            log_days: number;
            stop_count: number;
            /** Format: double */
            cycle_used_end_hrs: number;
            home_timezone: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    geocode_search: {
        parameters: {
            query: {
                /** @description Search text, at least 3 characters. */
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GeocodeResult"][];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    trips_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TripRequest"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripResponse"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    trips_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                trip_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
