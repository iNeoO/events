import {
	Badge,
	Button,
	Card,
	Container,
	Flex,
	Grid,
	Heading,
	Separator,
	Text,
} from "@radix-ui/themes";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	useByAlgorithm,
	useEventsPerDay,
	useInventoryKeys,
	useTopSourceIps,
} from "../hooks/query/stats.query";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function StatCard({
	title,
	value,
	subtitle,
	loading,
}: {
	title: string;
	value: string;
	subtitle: string;
	loading?: boolean;
}) {
	return (
		<Card size="3">
			<Flex direction="column" gap="2">
				<Text size="2" color="gray">
					{title}
				</Text>
				<Heading size="7">{loading ? "..." : value}</Heading>
				<Text size="2" color="gray">
					{subtitle}
				</Text>
			</Flex>
		</Card>
	);
}

export function IndexPage() {
	const eventsPerDay = useEventsPerDay();
	const byAlgorithm = useByAlgorithm({ displayBySeverity: true });
	const inventoryKeys = useInventoryKeys();
	const topSourceIps = useTopSourceIps({ limit: 5 });

	const totalEvents = (eventsPerDay.data?.data ?? []).reduce(
		(sum, item) => sum + item.count,
		0,
	);
	const topAlgorithmItem = (byAlgorithm.data?.data ?? []).reduce<
		{ algorithm: string; count: number } | undefined
	>((current, item) => {
		if (!current || item.count > current.count) {
			return { algorithm: item.algorithm, count: item.count };
		}
		return current;
	}, undefined);
	const inventoryTotal = (inventoryKeys.data?.data ?? []).reduce(
		(sum, item) => sum + item.count,
		0,
	);
	const topSourceIp = topSourceIps.data?.data?.[0];

	const hasAnyError =
		eventsPerDay.isError ||
		byAlgorithm.isError ||
		inventoryKeys.isError ||
		topSourceIps.isError;

	return (
		<Container size="4" py="8">
			<Flex direction="column" gap="6">
				<Flex justify="between" align="center" wrap="wrap" gap="3">
					<Flex direction="column" gap="1">
						<Heading size="8">Events Dashboard</Heading>
						<Text color="gray">Live stats from your events endpoints.</Text>
					</Flex>
					<Button asChild>
						<Link to="/events">Open Events Table</Link>
					</Button>
				</Flex>

				{hasAnyError ? (
					<Card>
						<Text color="red" size="2">
							Some stats failed to load. Data may be incomplete.
						</Text>
					</Card>
				) : null}

				<Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4">
					<StatCard
						title="Total Events"
						value={totalEvents.toLocaleString()}
						subtitle="Sum of events-per-day counts"
						loading={eventsPerDay.isLoading}
					/>
					<StatCard
						title="Top Algorithm"
						value={topAlgorithmItem?.algorithm ?? "-"}
						subtitle={
							topAlgorithmItem
								? `${topAlgorithmItem.count.toLocaleString()} events`
								: "No data"
						}
						loading={byAlgorithm.isLoading}
					/>
					<StatCard
						title="Inventory Keys"
						value={inventoryTotal.toLocaleString()}
						subtitle="Total keys across algorithms"
						loading={inventoryKeys.isLoading}
					/>
					<StatCard
						title="Top Source IP"
						value={topSourceIp?.sourceIp ?? "-"}
						subtitle={
							topSourceIp
								? `${topSourceIp.count.toLocaleString()} events`
								: "No data"
						}
						loading={topSourceIps.isLoading}
					/>
				</Grid>

				<Grid columns={{ initial: "1", md: "2" }} gap="4">
					<Card>
						<Flex direction="column" gap="3">
							<Heading size="4">Top Algorithms</Heading>
							<Separator size="4" />
							{(byAlgorithm.data?.data ?? []).slice(0, 5).map((item) => (
								<Flex key={item.algorithm} justify="between" align="center">
									<Text size="2">{item.algorithm}</Text>
									<Badge variant="soft">{item.count.toLocaleString()}</Badge>
								</Flex>
							))}
							{!byAlgorithm.isLoading &&
							(byAlgorithm.data?.data?.length ?? 0) === 0 ? (
								<Text size="2" color="gray">
									No data available.
								</Text>
							) : null}
						</Flex>
					</Card>

					<Card>
						<Flex direction="column" gap="3">
							<Heading size="4">Top Source IPs</Heading>
							<Separator size="4" />
							{(topSourceIps.data?.data ?? []).slice(0, 5).map((item) => (
								<Flex key={item.sourceIp} justify="between" align="center">
									<Text size="2">{item.sourceIp}</Text>
									<Badge variant="soft">{item.count.toLocaleString()}</Badge>
								</Flex>
							))}
							{!topSourceIps.isLoading &&
							(topSourceIps.data?.data?.length ?? 0) === 0 ? (
								<Text size="2" color="gray">
									No data available.
								</Text>
							) : null}
						</Flex>
					</Card>
				</Grid>
			</Flex>
		</Container>
	);
}
