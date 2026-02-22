import { z } from "zod";
import { SeveritySchema } from "./severity.schema.js";

export const GetEventsPerDayQueryParamsSchema = z
	.object({
		from: z.iso.datetime().optional(),
		to: z.iso.datetime().optional(),
	})
	.optional()
	.refine(
		(data) => {
			if (!data || !data.from || !data.to) return true;
			return data.from <= data.to;
		},
		{
			message: "The 'from' date must be before or equal to the 'to' date.",
		},
	);

export const GetByAlgorithmQueryParamsSchema = z
	.object({
		algorithm: z.string().trim().min(1).optional(),
		displayBySeverity: z.coerce.boolean().default(false),
	})
	.optional();

const AlgorithmsListSchema = z.preprocess((value) => {
	if (Array.isArray(value)) return value;
	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return value;
}, z.array(z.string().trim().min(1)).optional());

export const GetInventoryKeysQueryParamsSchema = z
	.object({
		assetType: z.string().trim().min(1).optional(),
		severity: SeveritySchema.optional(),
		year: z.coerce.number().int().min(1970).max(9999).optional(),
		algorithms: AlgorithmsListSchema,
	})
	.optional();

export const GetTopSourceIpsQueryParamsSchema = z
	.object({
		limit: z.coerce.number().int().min(1).max(100).default(10),
		assetType: z.string().trim().min(1).optional(),
		severity: SeveritySchema.optional(),
		algorithm: z.string().trim().min(1).optional(),
		from: z.iso.datetime().optional(),
		to: z.iso.datetime().optional(),
	})
	.optional()
	.refine(
		(data) => {
			if (!data || !data.from || !data.to) return true;
			return data.from <= data.to;
		},
		{
			message: "The 'from' date must be before or equal to the 'to' date.",
		},
	);
