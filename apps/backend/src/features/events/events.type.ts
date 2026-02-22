import type { z } from "zod";
import type { EventSchema } from "./events.schema.js";

type EventResponse = z.infer<typeof EventSchema>;
type Event = Omit<EventResponse, "observedAt"> & { observedAt: Date };

export type GetEventsResponseApi = {
	data: Event[];
	total: number;
};
