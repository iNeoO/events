import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prisma } from "./client.js";

const DEFAULT_COUNT = 30;

const assetTypes = ["certificate", "ssh-key", "api-key"] as const;
const algorithms = [
	"RSA2048",
	"RSA1024",
	"ECDSA-P256",
	"Ed25519",
	"SHA1",
	"3DES",
] as const;
const severities = ["info", "warning", "critical"] as const;
const eventTypes = [
	"observed",
	"rotation",
	"expiration-warning",
	"error",
] as const;

const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(values: readonly T[]): T =>
	values[randomInt(0, values.length - 1)];

const randomIp = () =>
	`${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;

const randomObservedAtToday = () => {
	const now = new Date();
	const startOfDay = new Date(now);
	startOfDay.setHours(0, 0, 0, 0);

	const min = startOfDay.getTime();
	const max = now.getTime();
	const timestamp = randomInt(min, max);

	return new Date(timestamp);
};

const parseCount = () => {
	const args = process.argv.slice(2);
	const countEqArg = args.find((arg) => arg.startsWith("--count="));
	const countArgIndex = args.indexOf("--count");

	let rawCount: string | undefined;

	if (countEqArg) {
		rawCount = countEqArg.split("=")[1];
	} else if (countArgIndex !== -1) {
		rawCount = args[countArgIndex + 1];
	} else if (args[0] && !args[0].startsWith("-")) {
		rawCount = args[0];
	}

	if (!rawCount) return DEFAULT_COUNT;

	const parsed = Number(rawCount);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error("Invalid count. Use a positive integer.");
	}

	return parsed;
};

const buildEvent = () => ({
	id: randomUUID(),
	assetId: `asset-${randomInt(1, 40)}`,
	assetType: pickOne(assetTypes),
	algorithm: pickOne(algorithms),
	severity: pickOne(severities),
	sourceIp: randomIp(),
	observedAt: randomObservedAtToday(),
	eventType: pickOne(eventTypes),
});

const main = async () => {
	const count = parseCount();
	const events = Array.from({ length: count }, buildEvent);

	await prisma.event.createMany({ data: events });

	console.log(`Seeded ${count} events for today.`);
};

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
