import { openApi400ZodError } from "@events/infra/helpers";
import { describeRoute, resolver } from "hono-openapi";
import { EventsJsonResponseSchema } from "./events.schema.js";

export const GetEventsRoute = describeRoute({
	description: "Get events with filters and pagination",
	responses: {
		200: {
			description: "Events retrieved successfully",
			content: {
				"application/json": {
					schema: resolver(EventsJsonResponseSchema),
				},
			},
		},
		...openApi400ZodError("Invalid query params"),
	},
});
