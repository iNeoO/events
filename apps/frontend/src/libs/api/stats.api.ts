import type {
	GetByAlgorithmQueryParams,
	GetEventsPerDayQueryParams,
	GetInventoryKeysQueryParams,
	GetTopSourceIpsQueryParams,
} from "@events/common/types";
import { client } from "../hc";

export async function getEventsPerDay(query?: GetEventsPerDayQueryParams) {
	const requestQuery = query
		? {
				...(query.from ? { from: query.from } : {}),
				...(query.to ? { to: query.to } : {}),
			}
		: undefined;

	const res = await client.v1.stats["events-per-day"].$get({
		query: requestQuery,
	});
	if (!res.ok) {
		throw new Error("Failed to fetch events per day stats");
	}
	return res.json();
}

export async function getByAlgorithm(query?: GetByAlgorithmQueryParams) {
	const requestQuery = query
		? {
				algorithm: query.algorithm,
				displayBySeverity:
					query.displayBySeverity !== undefined
						? String(query.displayBySeverity)
						: undefined,
			}
		: undefined;

	const res = await client.v1.stats["by-algorithm"].$get({
		query: requestQuery,
	});
	if (!res.ok) {
		throw new Error("Failed to fetch algorithm stats");
	}
	return res.json();
}

export async function getInventoryKeys(query?: GetInventoryKeysQueryParams) {
	const requestQuery = query
		? {
				assetType: query.assetType,
				severity: query.severity,
				year: query.year !== undefined ? String(query.year) : undefined,
				algorithms: query.algorithms,
			}
		: undefined;

	const res = await client.v1.stats["inventory-keys"].$get({
		query: requestQuery,
	});
	if (!res.ok) {
		throw new Error("Failed to fetch inventory keys stats");
	}
	return res.json();
}

export async function getTopSourceIps(query?: GetTopSourceIpsQueryParams) {
	const requestQuery = query
		? {
				...(query.limit !== undefined ? { limit: String(query.limit) } : {}),
				assetType: query.assetType,
				severity: query.severity,
				algorithm: query.algorithm,
				from: query.from,
				to: query.to,
			}
		: undefined;

	const res = await client.v1.stats["top-source-ips"].$get({
		query: requestQuery,
	});
	if (!res.ok) {
		throw new Error("Failed to fetch top source IPs stats");
	}
	return res.json();
}
