import type { GetEventsQueryParams } from "@events/common/types";
import { client } from "../hc";

export async function getEvents(query: GetEventsQueryParams) {
	const requestQuery = {
		...query,
		limit: String(query.limit),
		offset: String(query.offset),
	};

	const res = await client.v1.events.$get({ query: requestQuery });
	if (!res.ok) {
		throw new Error("Failed to fetch events");
	}
	const json = await res.json();
	return json;
}
