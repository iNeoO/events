import type { z } from "zod";

import type {
	GetByAlgorithmQueryParamsSchema,
	GetEventsPerDayQueryParamsSchema,
	GetInventoryKeysQueryParamsSchema,
	GetTopSourceIpsQueryParamsSchema,
} from "../schemas/stats.schema.js";

export type GetEventsPerDayQueryParams = z.infer<
	typeof GetEventsPerDayQueryParamsSchema
>;
export type GetByAlgorithmQueryParams = z.infer<
	typeof GetByAlgorithmQueryParamsSchema
>;
export type GetInventoryKeysQueryParams = z.infer<
	typeof GetInventoryKeysQueryParamsSchema
>;
export type GetTopSourceIpsQueryParams = z.infer<
	typeof GetTopSourceIpsQueryParamsSchema
>;
