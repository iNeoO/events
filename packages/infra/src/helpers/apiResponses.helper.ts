import type { ResolverReturnType } from "hono-openapi";
import { resolver } from "hono-openapi";
import { type ZodType, z } from "zod";
import { MetaSchema } from "../schemas/apiResponses.schema.js";

export const apiResponsesResolver = <T extends ZodType>(
	schema: T,
): ResolverReturnType =>
	resolver(
		z.object({
			data: schema,
			meta: z.optional(MetaSchema),
		}),
	);

export const apiResponseResolver = <T extends ZodType>(
	schema: T,
): ResolverReturnType =>
	resolver(
		z.object({
			data: schema,
		}),
	);

export const apiDeleteResponseResolver = <T extends ZodType>(
	id: T,
): ResolverReturnType =>
	resolver(
		z.object({
			data: z.object({
				id,
				deleted: z.boolean(),
			}),
		}),
	);

export const openApiResponses = <T extends ZodType>(
	schema: T,
	code = 200,
	description = "Successful response",
) => ({
	[code]: {
		description,
		content: {
			"application/json": { schema: apiResponsesResolver(schema) },
		},
	},
});

export const openApiResponse = <T extends ZodType>(
	schema: T,
	code = 200,
	description = "Successful response",
) => ({
	[code]: {
		description,
		content: {
			"application/json": { schema: apiResponseResolver(schema) },
		},
	},
});
