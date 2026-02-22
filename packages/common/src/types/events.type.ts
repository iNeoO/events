import type { z } from "zod";
import type { GetEventsQueryParamsSchema } from "../schemas/events.schema.js";

export type GetEventsQueryParams = z.infer<typeof GetEventsQueryParamsSchema>;
