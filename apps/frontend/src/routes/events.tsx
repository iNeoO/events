import { GetEventsQueryParamsSchema } from "@events/common/schemas";
import type { GetEventsQueryParams } from "@events/common/types";
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import { type EventRow, EventsTable } from "../components/events/events-table";
import { useEvents } from "../hooks/query/events.query";

export type EventsSearchParams = {
	limit?: number;
	offset?: number;
	sort?: GetEventsQueryParams["sort"];
	order?: GetEventsQueryParams["order"];
	assetId?: string;
	assetType?: string;
	algorithm?: string;
	severity?: GetEventsQueryParams["severity"];
	eventType?: string;
	sourceIp?: string;
};

export const DEFAULT_EVENTS_QUERY_PARAMS: Pick<
	Required<EventsSearchParams>,
	"limit" | "offset" | "sort" | "order"
> = {
	limit: 10,
	offset: 0,
	sort: "observedAt",
	order: "desc",
};

const normalizeEventsSearchParams = (
	search: Record<string, unknown>,
): EventsSearchParams => {
	const normalizedInput = {
		...search,
		assetId:
			typeof search.assetId === "string"
				? search.assetId.trim() || undefined
				: undefined,
		assetType:
			typeof search.assetType === "string"
				? search.assetType.trim() || undefined
				: undefined,
		algorithm:
			typeof search.algorithm === "string"
				? search.algorithm.trim() || undefined
				: undefined,
		eventType:
			typeof search.eventType === "string"
				? search.eventType.trim() || undefined
				: undefined,
		sourceIp:
			typeof search.sourceIp === "string"
				? search.sourceIp.trim() || undefined
				: undefined,
		severity:
			search.severity === "info" ||
			search.severity === "warning" ||
			search.severity === "critical"
				? search.severity
				: undefined,
	};
	const parsed = GetEventsQueryParamsSchema.safeParse(normalizedInput);
	if (parsed.success) {
		return {
			limit: parsed.data.limit,
			offset: parsed.data.offset,
			sort: parsed.data.sort,
			order: parsed.data.order,
			assetId: parsed.data.assetId,
			assetType: parsed.data.assetType,
			algorithm: parsed.data.algorithm,
			severity: parsed.data.severity,
			eventType: parsed.data.eventType,
			sourceIp: parsed.data.sourceIp,
		};
	}

	return {
		limit: DEFAULT_EVENTS_QUERY_PARAMS.limit,
		offset: DEFAULT_EVENTS_QUERY_PARAMS.offset,
		sort: DEFAULT_EVENTS_QUERY_PARAMS.sort,
		order: DEFAULT_EVENTS_QUERY_PARAMS.order,
	};
};

export const Route = createFileRoute("/events")({
	validateSearch: normalizeEventsSearchParams,
	component: EventsPage,
});

const SORT_COLUMNS: GetEventsQueryParams["sort"][] = [
	"observedAt",
	"assetType",
	"algorithm",
	"severity",
	"eventType",
	"sourceIp",
];

const toSortColumn = (value: string): GetEventsQueryParams["sort"] => {
	if (SORT_COLUMNS.includes(value as GetEventsQueryParams["sort"])) {
		return value as GetEventsQueryParams["sort"];
	}
	return "observedAt";
};

export function EventsPage() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();

	const limit = searchParams.limit ?? DEFAULT_EVENTS_QUERY_PARAMS.limit;
	const offset = searchParams.offset ?? DEFAULT_EVENTS_QUERY_PARAMS.offset;
	const sort = searchParams.sort ?? DEFAULT_EVENTS_QUERY_PARAMS.sort;
	const order = searchParams.order ?? DEFAULT_EVENTS_QUERY_PARAMS.order;
	const assetId = searchParams.assetId;
	const assetType = searchParams.assetType;
	const algorithm = searchParams.algorithm;
	const severity = searchParams.severity;
	const eventType = searchParams.eventType;
	const sourceIp = searchParams.sourceIp;

	const pageIndex = Math.floor(offset / limit);
	const pageSize = limit;
	const sorting: SortingState = [{ id: sort, desc: order === "desc" }];
	const columnFilters = {
		...(assetId ? { assetId } : {}),
		...(assetType ? { assetType } : {}),
		...(algorithm ? { algorithm } : {}),
		...(severity ? { severity } : {}),
		...(eventType ? { eventType } : {}),
		...(sourceIp ? { sourceIp } : {}),
	};

	const queryParams = useMemo<GetEventsQueryParams>(() => {
		return {
			limit,
			offset,
			sort,
			order,
			...(assetId ? { assetId } : {}),
			...(assetType ? { assetType } : {}),
			...(algorithm ? { algorithm } : {}),
			...(severity ? { severity } : {}),
			...(eventType ? { eventType } : {}),
			...(sourceIp ? { sourceIp } : {}),
		};
	}, [
		algorithm,
		assetId,
		assetType,
		eventType,
		limit,
		offset,
		order,
		severity,
		sort,
		sourceIp,
	]);

	const eventsQuery = useEvents(queryParams);
	const rows: EventRow[] = eventsQuery.data?.data ?? [];
	const totalRows = eventsQuery.data?.total ?? 0;
	const errorMessage =
		eventsQuery.error instanceof Error ? eventsQuery.error.message : undefined;

	return (
		<Container size="4" py="8">
			<Flex direction="column" gap="5">
				<Flex justify="between" align="center" gap="3" wrap="wrap">
					<Flex direction="column" gap="1">
						<Heading size="7">Events</Heading>
						<Text size="2" color="gray">
							Events list with server pagination and sorting.
						</Text>
					</Flex>
					<Button asChild variant="soft">
						<Link to="/">Back</Link>
					</Button>
				</Flex>
				<EventsTable
					data={rows}
					totalRows={totalRows}
					isLoading={eventsQuery.isLoading}
					errorMessage={errorMessage}
					pageIndex={pageIndex}
					pageSize={pageSize}
					sorting={sorting}
					columnFilters={columnFilters}
					onPageIndexChange={(nextPageIndex) =>
						navigate({
							search: (prev) => ({
								...prev,
								offset: nextPageIndex * limit,
							}),
							replace: true,
						})
					}
					onPageSizeChange={(nextSize) => {
						navigate({
							search: (prev) => ({
								...prev,
								limit: nextSize,
								offset: 0,
							}),
							replace: true,
						});
					}}
					onSortingChange={(nextSorting) => {
						const nextSort = nextSorting[0];
						const sortColumn = nextSort
							? toSortColumn(nextSort.id)
							: DEFAULT_EVENTS_QUERY_PARAMS.sort;
						const sortOrder = nextSort?.desc ? "desc" : "asc";
						navigate({
							search: (prev) => ({
								...prev,
								sort: sortColumn,
								order: sortOrder,
								offset: 0,
							}),
							replace: true,
						});
					}}
					onColumnFiltersChange={(nextFilters) =>
						navigate({
							search: (prev) => ({
								...prev,
								assetId: nextFilters.assetId || undefined,
								assetType: nextFilters.assetType || undefined,
								algorithm: nextFilters.algorithm || undefined,
								severity:
									nextFilters.severity === "info" ||
									nextFilters.severity === "warning" ||
									nextFilters.severity === "critical"
										? nextFilters.severity
										: undefined,
								eventType: nextFilters.eventType || undefined,
								sourceIp: nextFilters.sourceIp || undefined,
								offset: 0,
							}),
							replace: true,
						})
					}
				/>
			</Flex>
		</Container>
	);
}
