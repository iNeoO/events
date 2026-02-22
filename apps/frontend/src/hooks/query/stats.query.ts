import type {
	GetByAlgorithmQueryParams,
	GetEventsPerDayQueryParams,
	GetInventoryKeysQueryParams,
	GetTopSourceIpsQueryParams,
} from "@events/common/types";
import { useQuery } from "@tanstack/react-query";
import {
	getByAlgorithm,
	getEventsPerDay,
	getInventoryKeys,
	getTopSourceIps,
} from "../../libs/api/stats.api";

export function useEventsPerDay(query?: GetEventsPerDayQueryParams) {
	return useQuery({
		queryKey: ["eventsPerDay", query],
		queryFn: () => getEventsPerDay(query),
	});
}

export function useByAlgorithm(query?: GetByAlgorithmQueryParams) {
	return useQuery({
		queryKey: ["byAlgorithm", query],
		queryFn: () => getByAlgorithm(query),
	});
}

export function useInventoryKeys(query?: GetInventoryKeysQueryParams) {
	return useQuery({
		queryKey: ["inventoryKeys", query],
		queryFn: () => getInventoryKeys(query),
	});
}

export function useTopSourceIps(query?: GetTopSourceIpsQueryParams) {
	return useQuery({
		queryKey: ["topSourceIps", query],
		queryFn: () => getTopSourceIps(query),
	});
}
