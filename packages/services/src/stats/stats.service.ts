import type { Prisma, PrismaClient } from "@events/db";
import type {
	ByAlgorithmStat,
	GetByAlgorithmQueryParams,
	GetEventsPerDayQueryParams,
	GetInventoryKeysQueryParams,
	GetTopSourceIpsQueryParams,
} from "./stats.type.js";

export class StatsService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async getEventsPerDay(params?: GetEventsPerDayQueryParams) {
		const from = params?.from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const to = params?.to ?? new Date();

		const start = new Date(from);
		start.setHours(0, 0, 0, 0);

		const end = new Date(to);
		end.setHours(23, 59, 59, 999);

		const events = await this.prisma.event.findMany({
			where: {
				observedAt: {
					gte: start,
					lte: end,
				},
			},
			select: {
				observedAt: true,
			},
			orderBy: {
				observedAt: "asc",
			},
		});

		const countsByDay = new Map<string, number>();

		for (const event of events) {
			const day = event.observedAt.toISOString().slice(0, 10);
			countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
		}

		return Array.from(countsByDay.entries()).map(([day, count]) => ({
			day,
			count,
		}));
	}

	async getByAlgorithm(params?: GetByAlgorithmQueryParams) {
		const { algorithm = "", displayBySeverity = false } = params ?? {};
		if (displayBySeverity) {
			const rows = await this.prisma.event.groupBy({
				by: ["algorithm", "severity"],
				where: algorithm
					? {
							algorithm: {
								contains: algorithm,
								mode: "insensitive",
							},
						}
					: undefined,
				_count: {
					_all: true,
				},
				orderBy: [
					{
						algorithm: "asc",
					},
					{
						severity: "asc",
					},
				],
			});

			const map = new Map<string, ByAlgorithmStat>();

			for (const row of rows) {
				const current = map.get(row.algorithm) ?? {
					algorithm: row.algorithm,
					count: 0,
					bySeverity: {
						info: 0,
						warning: 0,
						critical: 0,
					},
				};

				current.count += row._count._all;
				if (current.bySeverity && row.severity in current.bySeverity) {
					current.bySeverity[row.severity] += row._count._all;
				}
				map.set(row.algorithm, current);
			}

			return Array.from(map.values()).sort((a, b) => b.count - a.count);
		}

		const result = await this.prisma.event.groupBy({
			by: ["algorithm"],
			where: algorithm
				? {
						algorithm: {
							contains: algorithm,
							mode: "insensitive",
						},
					}
				: undefined,
			_count: {
				_all: true,
			},
			orderBy: {
				_count: {
					algorithm: "desc",
				},
			},
		});

		return result.map((row) => ({
			algorithm: row.algorithm,
			count: row._count._all,
		}));
	}

	async getInventoryKeys(params?: GetInventoryKeysQueryParams) {
		const { assetType, severity, year, algorithms } = params ?? {};

		const startOfYear =
			typeof year === "number"
				? new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
				: undefined;
		const endOfYear =
			typeof year === "number"
				? new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0))
				: undefined;

		const where: Prisma.EventWhereInput = {
			...(assetType ? { assetType } : {}),
			...(severity ? { severity } : {}),
			...(algorithms?.length ? { algorithm: { in: algorithms } } : {}),
			...(startOfYear || endOfYear
				? {
						observedAt: {
							...(startOfYear ? { gte: startOfYear } : {}),
							...(endOfYear ? { lt: endOfYear } : {}),
						},
					}
				: {}),
		};

		const uniqueAssetAlgorithms = await this.prisma.event.findMany({
			where,
			select: {
				assetId: true,
				algorithm: true,
			},
			distinct: ["assetId", "algorithm"],
		});

		const countByAlgorithm = new Map<string, number>();
		for (const row of uniqueAssetAlgorithms) {
			countByAlgorithm.set(
				row.algorithm,
				(countByAlgorithm.get(row.algorithm) ?? 0) + 1,
			);
		}

		return Array.from(countByAlgorithm.entries())
			.map(([algorithm, count]) => ({ algorithm, count }))
			.sort((a, b) => b.count - a.count);
	}

	async getTopSourceIps(params?: GetTopSourceIpsQueryParams) {
		const {
			limit = 10,
			assetType,
			severity,
			algorithm,
			from,
			to,
		} = params ?? {};

		const where: Prisma.EventWhereInput = {
			...(assetType ? { assetType } : {}),
			...(severity ? { severity } : {}),
			...(algorithm
				? {
						algorithm: {
							contains: algorithm,
							mode: "insensitive",
						},
					}
				: {}),
			...(from || to
				? {
						observedAt: {
							...(from ? { gte: from } : {}),
							...(to ? { lte: to } : {}),
						},
					}
				: {}),
		};

		const rows = await this.prisma.event.groupBy({
			by: ["sourceIp"],
			where,
			_count: {
				_all: true,
			},
			orderBy: {
				_count: {
					sourceIp: "desc",
				},
			},
			take: limit,
		});

		return rows.map((row) => ({
			sourceIp: row.sourceIp,
			count: row._count._all,
		}));
	}
}
