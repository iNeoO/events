import { type PrismaClient, prisma } from "@events/db";
import { EventsService, StatsService } from "@events/services";

export type AppServices = {
	prisma: PrismaClient;
	eventsService: EventsService;
	statsService: StatsService;
};

export const createServices = (): AppServices => {
	const eventsService = new EventsService(prisma);
	const statsService = new StatsService(prisma);

	return {
		prisma,
		eventsService,
		statsService,
	};
};

export const services: AppServices = createServices();
