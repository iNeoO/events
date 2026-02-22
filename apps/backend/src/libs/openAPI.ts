import type { LogsBindings } from "@events/infra/factories";
import { Scalar } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export function setupOpenAPI(app: Hono<LogsBindings>) {
	app.get(
		"/openapi/spec",
		openAPIRouteHandler(app, {
			documentation: {
				info: {
					title: "Swagger",
					version: "1.0.0",
					description: "Swagger API",
				},
				servers: [
					{
						url: `${FRONTEND_URL}/api`,
						description: "API server",
					},
				],
			},
		}),
	);

	app.get(
		"/openapi/ui",
		Scalar({
			theme: "deepSpace",
			url: `/api/v1/openapi/spec`,
		}),
	);
}
