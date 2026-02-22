import { appWithLogs } from "@events/infra/factories";
import { validator } from "hono-openapi";
import type { AppServices } from "../../services/container.js";
import { GetEventsRoute } from "./events.route.js";
import { GetEventsQueryParamsSchema } from "./events.schema.js";
import type { GetEventsResponseApi } from "./events.type.js";

export const createEventsController = (servicesContainer: AppServices) => {
	return appWithLogs
		.createApp()
		.get(
			"/",
			GetEventsRoute,
			validator("query", GetEventsQueryParamsSchema),
			async (c) => {
				const { eventsService } = servicesContainer;
				const queryParams = c.req.valid("query");
				const events = await eventsService.getEvents(queryParams);
				return c.json({
					data: events.items,
					total: events.pagination.total,
				} satisfies GetEventsResponseApi);
			},
		);
};
