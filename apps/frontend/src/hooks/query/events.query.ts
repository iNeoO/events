import type { GetEventsQueryParams } from "@events/common/types";
import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { getEvents } from "../../libs/api/events.api";

export const eventsOptions = (queryParams: GetEventsQueryParams) =>
	queryOptions({
		queryKey: ["events", queryParams],
		queryFn: () => getEvents(queryParams),
		placeholderData: keepPreviousData,
	});

export const useEvents = (queryParams: GetEventsQueryParams) => {
	return useQuery(eventsOptions(queryParams));
};
