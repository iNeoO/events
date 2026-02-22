import { z } from "zod";

export const SeveritySchema = z.enum(["info", "warning", "critical"] as const);
