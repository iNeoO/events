import type { z } from "zod";
import type {
	ByAlgorithmStatSchema,
	EventsPerDayStatSchema,
	InventoryKeysStatSchema,
	TopSourceIpStatSchema,
} from "./stats.schema.js";

export type EventsPerDayStatResponse = z.infer<typeof EventsPerDayStatSchema>;
export type ByAlgorithmStatResponse = z.infer<typeof ByAlgorithmStatSchema>;
export type InventoryKeysStatResponse = z.infer<typeof InventoryKeysStatSchema>;
export type TopSourceIpStatResponse = z.infer<typeof TopSourceIpStatSchema>;

export type GetEventsPerDayResponseApi = {
	data: EventsPerDayStatResponse[];
};

export type GetByAlgorithmResponseApi = {
	data: ByAlgorithmStatResponse[];
};

export type GetInventoryKeysResponseApi = {
	data: InventoryKeysStatResponse[];
};

export type GetTopSourceIpsResponseApi = {
	data: TopSourceIpStatResponse[];
};
