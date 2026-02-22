import { pinoLogger } from "@events/infra/libs";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { setupOpenAPI } from "./libs/openAPI.js";
import { services } from "./services/container.js";

const app = createApp(services);

setupOpenAPI(app);

const server = serve(
	{
		fetch: app.fetch,
		port: 4000,
	},
	(info) => {
		pinoLogger.info(`Server is running on http://localhost:${info.port}`);
	},
);

const gracefulShutdown = async (signal: string) => {
	pinoLogger.info(`${signal} received. Graceful shutdown initiated.`);
	await new Promise<void>((resolve, reject) => {
		server.close((err) => {
			if (err) {
				reject(err);
			} else {
				pinoLogger.info("HTTP server closed");
				resolve();
			}
		});
	});

	await services.prisma.$disconnect();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
