import { appWithLogs } from "@events/infra/factories";
import { validator } from "hono-openapi";
import type { AppServices } from "../../services/container.js";
import {
	GetByAlgorithmRoute,
	GetEventsPerDayRoute,
	GetInventoryKeysRoute,
	GetTopSourceIpsRoute,
} from "./stats.route.js";
import {
	GetByAlgorithmQueryParamsSchema,
	GetEventsPerDayQueryParamsSchema,
	GetInventoryKeysQueryParamsSchema,
	GetTopSourceIpsQueryParamsSchema,
} from "./stats.schema.js";
import type {
	GetByAlgorithmResponseApi,
	GetEventsPerDayResponseApi,
	GetInventoryKeysResponseApi,
	GetTopSourceIpsResponseApi,
} from "./stats.type.js";

type StatsControllerServices = Pick<AppServices, "statsService">;

export const createStatsController = (services: StatsControllerServices) => {
	return appWithLogs
		.createApp()
		.get(
			"/events-per-day",
			GetEventsPerDayRoute,
			validator("query", GetEventsPerDayQueryParamsSchema),
			async (c) => {
				const query = c.req.valid("query");
				const data = await services.statsService.getEventsPerDay(query);
				return c.json({ data } satisfies GetEventsPerDayResponseApi, 200);
			},
		)
		.get(
			"/by-algorithm",
			GetByAlgorithmRoute,
			validator("query", GetByAlgorithmQueryParamsSchema),
			async (c) => {
				const query = c.req.valid("query");
				const data = await services.statsService.getByAlgorithm(query);
				return c.json({ data } satisfies GetByAlgorithmResponseApi, 200);
			},
		)
		.get(
			"/inventory-keys",
			GetInventoryKeysRoute,
			validator("query", GetInventoryKeysQueryParamsSchema),
			async (c) => {
				const query = c.req.valid("query");
				const data = await services.statsService.getInventoryKeys(query);
				return c.json({ data } satisfies GetInventoryKeysResponseApi, 200);
			},
		)
		.get(
			"/top-source-ips",
			GetTopSourceIpsRoute,
			validator("query", GetTopSourceIpsQueryParamsSchema),
			async (c) => {
				const query = c.req.valid("query");
				const data = await services.statsService.getTopSourceIps(query);
				return c.json({ data } satisfies GetTopSourceIpsResponseApi, 200);
			},
		);
};
