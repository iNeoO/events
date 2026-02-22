import { z } from "zod";

export {
	GetByAlgorithmQueryParamsSchema,
	GetEventsPerDayQueryParamsSchema,
	GetInventoryKeysQueryParamsSchema,
	GetTopSourceIpsQueryParamsSchema,
} from "@events/common/schemas";

const BySeveritySchema = z.object({
	info: z.number().int().nonnegative(),
	warning: z.number().int().nonnegative(),
	critical: z.number().int().nonnegative(),
});

export const EventsPerDayStatSchema = z.object({
	day: z.string(),
	count: z.number().int().nonnegative(),
});

export const ByAlgorithmStatSchema = z.object({
	algorithm: z.string(),
	count: z.number().int().nonnegative(),
	bySeverity: BySeveritySchema.optional(),
});

export const GetEventsPerDayJsonResponseSchema = z.object({
	data: z.array(EventsPerDayStatSchema),
});

export const GetByAlgorithmJsonResponseSchema = z.object({
	data: z.array(ByAlgorithmStatSchema),
});

export const InventoryKeysStatSchema = z.object({
	algorithm: z.string(),
	count: z.number().int().nonnegative(),
});

export const TopSourceIpStatSchema = z.object({
	sourceIp: z.ipv4(),
	count: z.number().int().nonnegative(),
});

export const GetInventoryKeysJsonResponseSchema = z.object({
	data: z.array(InventoryKeysStatSchema),
});

export const GetTopSourceIpsJsonResponseSchema = z.object({
	data: z.array(TopSourceIpStatSchema),
});
