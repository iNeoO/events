import type { ResolverReturnType } from "hono-openapi";
import { resolver } from "hono-openapi";
import {
	ErrorSchema,
	ZodSafeParseErrorSchema,
} from "../schemas/apiErrors.schema.js";

export const apiErrorResolver = (): ResolverReturnType => resolver(ErrorSchema);
export const apiZodErrorResolver = (): ResolverReturnType =>
	resolver(ZodSafeParseErrorSchema);

export const openApi400ZodError = (description: string) => ({
	400: {
		description,
		content: {
			"application/json": { schema: apiZodErrorResolver() },
		},
	},
});
