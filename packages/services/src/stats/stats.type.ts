export {
	GetByAlgorithmQueryParams,
	GetEventsPerDayQueryParams,
	GetInventoryKeysQueryParams,
	GetTopSourceIpsQueryParams,
} from "@events/common/types";

export type ByAlgorithmStat = {
	algorithm: string;
	count: number;
	bySeverity?: {
		info: number;
		warning: number;
		critical: number;
	};
};
