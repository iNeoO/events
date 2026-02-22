import { z } from "zod";

export { GetEventsQueryParamsSchema } from "@events/common/schemas";

import { SeveritySchema } from "@events/common/schemas";

export const EventSchema = z.object({
	id: z.string(),
	assetId: z.string(),
	assetType: z.string(),
	algorithm: z.string(),
	severity: SeveritySchema,
	eventType: z.string(),
	sourceIp: z.ipv4(),
	observedAt: z.iso.datetime(),
});

export const EventsJsonResponseSchema = z.object({
	data: z.array(EventSchema),
	total: z.number().int().nonnegative(),
});
