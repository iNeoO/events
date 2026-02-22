import { openApi400ZodError } from "@events/infra/helpers";
import { describeRoute, resolver } from "hono-openapi";
import {
	GetByAlgorithmJsonResponseSchema,
	GetEventsPerDayJsonResponseSchema,
	GetInventoryKeysJsonResponseSchema,
	GetTopSourceIpsJsonResponseSchema,
} from "./stats.schema.js";

export const GetEventsPerDayRoute = describeRoute({
	description: "Get event counts per day for a date range",
	responses: {
		200: {
			description: "Event counts retrieved successfully",
			content: {
				"application/json": {
					schema: resolver(GetEventsPerDayJsonResponseSchema),
				},
			},
		},
		...openApi400ZodError("Invalid query params"),
	},
});

export const GetByAlgorithmRoute = describeRoute({
	description: "Get event counts by algorithm, optionally by severity",
	responses: {
		200: {
			description: "Algorithm stats retrieved successfully",
			content: {
				"application/json": {
					schema: resolver(GetByAlgorithmJsonResponseSchema),
				},
			},
		},
		...openApi400ZodError("Invalid query params"),
	},
});

export const GetInventoryKeysRoute = describeRoute({
	description:
		"Get inventory keys stats with filters on asset type, severity, year and algorithms",
	responses: {
		200: {
			description: "Inventory keys stats retrieved successfully",
			content: {
				"application/json": {
					schema: resolver(GetInventoryKeysJsonResponseSchema),
				},
			},
		},
		...openApi400ZodError("Invalid query params"),
	},
});

export const GetTopSourceIpsRoute = describeRoute({
	description: "Get top source IPs generating the most events",
	responses: {
		200: {
			description: "Top source IP stats retrieved successfully",
			content: {
				"application/json": {
					schema: resolver(GetTopSourceIpsJsonResponseSchema),
				},
			},
		},
		...openApi400ZodError("Invalid query params"),
	},
});
