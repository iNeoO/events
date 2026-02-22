import { type Client, hcWithType } from "@events/backend/hc";

export const client = hcWithType("/api");

export type App = Client;
