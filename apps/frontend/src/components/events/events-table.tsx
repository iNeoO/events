import { Badge } from "@radix-ui/themes";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "../ui/data-table";

export type EventRow = {
	id: string;
	assetId: string;
	assetType: string;
	algorithm: string;
	severity: string;
	eventType: string;
	sourceIp: string;
	observedAt: string | Date;
};

type EventsTableProps = {
	data: EventRow[];
	totalRows?: number;
	isLoading?: boolean;
	errorMessage?: string;
	pageIndex?: number;
	pageSize?: number;
	sorting?: SortingState;
	columnFilters?: Record<string, string>;
	onPageIndexChange?: (pageIndex: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	onSortingChange?: (sorting: SortingState) => void;
	onColumnFiltersChange?: (filters: Record<string, string>) => void;
};

const formatObservedAt = (value: EventRow["observedAt"]) => {
	if (value instanceof Date) {
		return value.toLocaleString();
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return String(value);
	return parsed.toLocaleString();
};

const severityColor = (severity: string): "gray" | "amber" | "red" => {
	const normalized = severity.toLowerCase();
	if (normalized === "critical") return "red";
	if (normalized === "warning") return "amber";
	return "gray";
};

export function EventsTable({
	data,
	totalRows,
	isLoading,
	errorMessage,
	pageIndex,
	pageSize,
	sorting,
	columnFilters,
	onPageIndexChange,
	onPageSizeChange,
	onSortingChange,
	onColumnFiltersChange,
}: EventsTableProps) {
	const columns = useMemo<ColumnDef<EventRow>[]>(
		() => [
			{
				accessorKey: "assetId",
				header: "Asset ID",
				enableSorting: false,
			},
			{
				accessorKey: "assetType",
				header: "Asset Type",
			},
			{
				accessorKey: "algorithm",
				header: "Algorithm",
			},
			{
				accessorKey: "severity",
				header: "Severity",
				cell: ({ row }) => (
					<Badge color={severityColor(row.original.severity)} variant="soft">
						{row.original.severity}
					</Badge>
				),
			},
			{
				accessorKey: "eventType",
				header: "Event Type",
			},
			{
				accessorKey: "sourceIp",
				header: "Source IP",
			},
			{
				accessorKey: "observedAt",
				header: "Observed At",
				cell: ({ row }) => formatObservedAt(row.original.observedAt),
			},
		],
		[],
	);

	return (
		<DataTable
			data={data}
			columns={columns}
			filterableColumns={[
				{ id: "assetId", label: "Asset ID" },
				{ id: "assetType", label: "Asset Type" },
				{ id: "algorithm", label: "Algorithm" },
				{ id: "severity", label: "Severity" },
				{ id: "eventType", label: "Event Type" },
				{ id: "sourceIp", label: "Source IP" },
			]}
			totalRows={totalRows}
			pageIndex={pageIndex}
			pageSize={pageSize}
			sorting={sorting}
			columnFilters={columnFilters}
			onPageIndexChange={onPageIndexChange}
			onPageSizeChange={onPageSizeChange}
			onSortingChange={onSortingChange}
			onColumnFiltersChange={onColumnFiltersChange}
			isLoading={isLoading}
			errorMessage={errorMessage}
			emptyMessage="No events found."
			pageSizeOptions={[10, 20, 50, 100]}
		/>
	);
}
