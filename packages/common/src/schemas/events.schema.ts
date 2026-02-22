import { z } from "zod";
import { PaginationQueryParamsSchema } from "./pagination.schema.js";
import { SeveritySchema } from "./severity.schema.js";

export const GetEventsQueryParamsSchema = PaginationQueryParamsSchema([
	"observedAt",
	"assetType",
	"algorithm",
	"severity",
	"eventType",
	"sourceIp",
] as const)
	.extend({
		assetId: z.string().trim().min(1).optional(),
		assetType: z.string().trim().min(1).optional(),
		algorithm: z.string().trim().min(1).optional(),
		severity: SeveritySchema.optional(),
		eventType: z.string().trim().min(1).optional(),
		sourceIp: z.ipv4().optional(),
		startDate: z.iso.datetime().optional(),
		endDate: z.iso.datetime().optional(),
	})
	.refine(
		({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
		{
			message: "startDate must be before or equal to endDate",
			path: ["endDate"],
		},
	);
