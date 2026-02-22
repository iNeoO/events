import type { Prisma, PrismaClient } from "@events/db";
import type { GetEventsQueryParams } from "./events.type.js";

export class EventsService {
	private prisma: PrismaClient;
	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async getEvents(query: GetEventsQueryParams) {
		const {
			search,
			limit,
			offset,
			sort,
			order,
			assetId,
			assetType,
			algorithm,
			severity,
			eventType,
			sourceIp,
			startDate,
			endDate,
		} = query;

		const where: Prisma.EventWhereInput = {
			...(assetId ? { assetId } : {}),
			...(assetType ? { assetType } : {}),
			...(algorithm ? { algorithm } : {}),
			...(severity ? { severity } : {}),
			...(eventType ? { eventType } : {}),
			...(sourceIp ? { sourceIp } : {}),
			...(startDate || endDate
				? {
						observedAt: {
							...(startDate ? { gte: startDate } : {}),
							...(endDate ? { lte: endDate } : {}),
						},
					}
				: {}),
			...(search
				? {
						OR: [
							{ assetId: { contains: search, mode: "insensitive" } },
							{ assetType: { contains: search, mode: "insensitive" } },
							{ algorithm: { contains: search, mode: "insensitive" } },
							{ sourceIp: { contains: search, mode: "insensitive" } },
							{ eventType: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.event.findMany({
				where,
				orderBy: { [sort]: order },
				skip: offset,
				take: limit,
			}),
			this.prisma.event.count({ where }),
		]);

		return {
			items,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
		};
	}
}
