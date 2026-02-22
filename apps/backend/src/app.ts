import { logMiddleware } from "@events/infra/middlewares";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { createEventsController } from "./features/events/events.controller.js";
import { createStatsController } from "./features/stats/stats.controller.js";
import { errorHandler } from "./helpers/errors.js";
import {
	type AppServices,
	createServices,
	services,
} from "./services/container.js";

export { createServices };

export const createApp = (servicesContainer: AppServices = services) => {
	const eventsController = createEventsController(servicesContainer);
	const statsController = createStatsController(servicesContainer);

	return new Hono()
		.basePath("/v1")
		.use(requestId())
		.use(logMiddleware)
		.use(secureHeaders())
		.route("/events", eventsController)
		.route("/stats", statsController)
		.onError(errorHandler);
};

const app = createApp(services);

export default app;
