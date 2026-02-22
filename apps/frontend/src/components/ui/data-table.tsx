import {
	Badge,
	Box,
	Button,
	Flex,
	Select,
	Table,
	Text,
} from "@radix-ui/themes";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { ColumnFilterPopover } from "./column-filter-popover";

type FilterableColumn = {
	id: string;
	label: string;
	placeholder?: string;
};

type DataTableProps<TData> = {
	data: TData[];
	columns: ColumnDef<TData, unknown>[];
	totalRows?: number;
	pageIndex?: number;
	pageSize?: number;
	sorting?: SortingState;
	pageSizeOptions?: number[];
	isLoading?: boolean;
	errorMessage?: string;
	emptyMessage?: string;
	filterableColumns?: FilterableColumn[];
	columnFilters?: Record<string, string>;
	onPageIndexChange?: (pageIndex: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	onSortingChange?: (sorting: SortingState) => void;
	onColumnFiltersChange?: (filters: Record<string, string>) => void;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function DataTable<TData>({
	data,
	columns,
	totalRows,
	pageIndex,
	pageSize,
	sorting,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	isLoading = false,
	errorMessage,
	emptyMessage = "No data found.",
	filterableColumns = [],
	columnFilters,
	onPageIndexChange,
	onPageSizeChange,
	onSortingChange,
	onColumnFiltersChange,
}: DataTableProps<TData>) {
	const [internalSorting, setInternalSorting] = useState<SortingState>([]);
	const [internalPagination, setInternalPagination] = useState<PaginationState>(
		{
			pageIndex: 0,
			pageSize: pageSizeOptions[0] ?? 10,
		},
	);
	const [internalColumnFilters, setInternalColumnFilters] = useState<
		Record<string, string>
	>({});

	const resolvedSorting = sorting ?? internalSorting;
	const resolvedColumnFilters = columnFilters ?? internalColumnFilters;
	const filterableColumnsMap = useMemo(
		() => new Map(filterableColumns.map((column) => [column.id, column])),
		[filterableColumns],
	);
	const activeFilters = useMemo(
		() =>
			filterableColumns
				.map((column) => ({
					...column,
					value: resolvedColumnFilters[column.id],
				}))
				.filter((column) => Boolean(column.value)),
		[filterableColumns, resolvedColumnFilters],
	);
	const resolvedPagination: PaginationState = {
		pageIndex: pageIndex ?? internalPagination.pageIndex,
		pageSize: pageSize ?? internalPagination.pageSize,
	};

	const isPaginationControlled =
		pageIndex !== undefined &&
		pageSize !== undefined &&
		onPageIndexChange !== undefined &&
		onPageSizeChange !== undefined;
	const hasPartialPaginationControl =
		(pageIndex !== undefined ||
			pageSize !== undefined ||
			onPageIndexChange !== undefined ||
			onPageSizeChange !== undefined) &&
		!isPaginationControlled;
	const isManualPagination = isPaginationControlled && totalRows !== undefined;
	const isManualSorting = onSortingChange !== undefined;

	useEffect(() => {
		if (import.meta.env.DEV && hasPartialPaginationControl) {
			console.warn(
				"DataTable pagination should be either fully controlled (pageIndex, pageSize, onPageIndexChange, onPageSizeChange) or fully uncontrolled.",
			);
		}
	}, [hasPartialPaginationControl]);

	const pageCount = useMemo(() => {
		if (!isManualPagination || totalRows === undefined) return undefined;
		return Math.max(1, Math.ceil(totalRows / resolvedPagination.pageSize));
	}, [isManualPagination, resolvedPagination.pageSize, totalRows]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting: resolvedSorting,
			pagination: resolvedPagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: isManualSorting ? undefined : getSortedRowModel(),
		getPaginationRowModel: isManualPagination
			? undefined
			: getPaginationRowModel(),
		manualSorting: isManualSorting,
		manualPagination: isManualPagination,
		pageCount,
		onSortingChange: (updater) => {
			const nextSorting =
				typeof updater === "function" ? updater(resolvedSorting) : updater;
			if (onSortingChange) {
				onSortingChange(nextSorting);
			} else {
				setInternalSorting(nextSorting);
			}
		},
		onPaginationChange: (updater) => {
			const nextPagination =
				typeof updater === "function" ? updater(resolvedPagination) : updater;
			if (isPaginationControlled) {
				onPageIndexChange(nextPagination.pageIndex);
				onPageSizeChange(nextPagination.pageSize);
				return;
			}
			setInternalPagination(nextPagination);
		},
	});

	const rowCount = table.getRowModel().rows.length;
	const totalPages = table.getPageCount();
	const currentPage = resolvedPagination.pageIndex + 1;
	const pageSizeValue = String(resolvedPagination.pageSize);
	const canGoPrevious = table.getCanPreviousPage();
	const canGoNext = table.getCanNextPage();
	const totalCount = totalRows ?? rowCount;
	const rangeStart =
		totalCount === 0
			? 0
			: resolvedPagination.pageIndex * resolvedPagination.pageSize + 1;
	const rangeEnd = Math.min(
		resolvedPagination.pageIndex * resolvedPagination.pageSize + rowCount,
		totalCount,
	);
	const goToPage = (nextPageIndex: number) => {
		if (isPaginationControlled) {
			onPageIndexChange(nextPageIndex);
			return;
		}
		table.setPageIndex(nextPageIndex);
	};
	const updateColumnFilter = (columnId: string, value?: string) => {
		const nextFilters = { ...resolvedColumnFilters };
		if (value) {
			nextFilters[columnId] = value;
		} else {
			delete nextFilters[columnId];
		}
		if (onColumnFiltersChange) {
			onColumnFiltersChange(nextFilters);
		} else {
			setInternalColumnFilters(nextFilters);
		}
	};

	return (
		<Box>
			{activeFilters.length > 0 ? (
				<Flex align="center" gap="2" wrap="wrap" mb="3">
					{activeFilters.map((column) => (
						<Flex key={column.id} align="center" gap="2">
							<Text size="2" color="gray">
								{column.label} contains:
							</Text>
							<Badge color="indigo" variant="soft">
								{column.value}
							</Badge>
							<Button
								type="button"
								variant="ghost"
								size="1"
								onClick={() => updateColumnFilter(column.id, undefined)}
							>
								Clear
							</Button>
						</Flex>
					))}
				</Flex>
			) : null}

			<Box
				style={{
					border: "1px solid var(--gray-5)",
					borderRadius: "8px",
					overflow: "hidden",
				}}
			>
				<Table.Root>
					<Table.Header>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Row key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<Table.ColumnHeaderCell key={header.id}>
										{header.isPlaceholder ? null : (
											<Flex align="center" gap="2">
												<Text size="2" weight="medium">
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
												</Text>
												{header.column.getCanSort() ? (
													<Button
														type="button"
														variant="ghost"
														size="1"
														onClick={() => header.column.toggleSorting()}
													>
														{header.column.getIsSorted() === "asc"
															? "↑"
															: header.column.getIsSorted() === "desc"
																? "↓"
																: "↕"}
													</Button>
												) : null}
												{filterableColumnsMap.has(header.column.id) ? (
													<ColumnFilterPopover
														label={
															filterableColumnsMap.get(header.column.id)
																?.label ?? header.column.id
														}
														placeholder={
															filterableColumnsMap.get(header.column.id)
																?.placeholder
														}
														value={resolvedColumnFilters[header.column.id]}
														onChange={(value) =>
															updateColumnFilter(header.column.id, value)
														}
													/>
												) : null}
											</Flex>
										)}
									</Table.ColumnHeaderCell>
								))}
							</Table.Row>
						))}
					</Table.Header>
					<Table.Body>
						{isLoading ? (
							<Table.Row>
								<Table.Cell colSpan={columns.length}>
									<Text size="2" color="gray">
										Loading...
									</Text>
								</Table.Cell>
							</Table.Row>
						) : errorMessage ? (
							<Table.Row>
								<Table.Cell colSpan={columns.length}>
									<Text size="2" color="red">
										{errorMessage}
									</Text>
								</Table.Cell>
							</Table.Row>
						) : rowCount === 0 ? (
							<Table.Row>
								<Table.Cell colSpan={columns.length}>
									<Text size="2" color="gray">
										{emptyMessage}
									</Text>
								</Table.Cell>
							</Table.Row>
						) : (
							table.getRowModel().rows.map((row) => (
								<Table.Row key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<Table.Cell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</Table.Cell>
									))}
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table.Root>
			</Box>

			<Flex justify="between" align="center" mt="4" gap="3" wrap="wrap">
				<Flex align="center" gap="2">
					<Text size="2" color="gray">
						Rows per page
					</Text>
					<Select.Root
						value={pageSizeValue}
						onValueChange={(value) => {
							const nextSize = Number(value);
							if (isPaginationControlled) {
								onPageSizeChange(nextSize);
								onPageIndexChange(0);
							} else {
								table.setPageSize(nextSize);
								table.setPageIndex(0);
							}
						}}
					>
						<Select.Trigger />
						<Select.Content>
							{pageSizeOptions.map((size) => (
								<Select.Item key={size} value={String(size)}>
									{size}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</Flex>

				<Flex align="center" gap="2">
					<Text size="2" color="gray">
						Total {totalCount}
					</Text>
					<Text size="2" color="gray">
						Showing {rangeStart}-{rangeEnd}
					</Text>
				</Flex>

				<Flex align="center" gap="2">
					<Text size="2" color="gray">
						Page {currentPage} of {Math.max(1, totalPages)}
					</Text>
					<Button
						type="button"
						variant="soft"
						size="1"
						disabled={!canGoPrevious}
						onClick={() => goToPage(0)}
					>
						First
					</Button>
					<Button
						type="button"
						variant="soft"
						size="1"
						disabled={!canGoPrevious}
						onClick={() =>
							goToPage(Math.max(0, resolvedPagination.pageIndex - 1))
						}
					>
						Prev
					</Button>
					<Button
						type="button"
						variant="soft"
						size="1"
						disabled={!canGoNext}
						onClick={() =>
							goToPage(
								Math.min(
									Math.max(0, totalPages - 1),
									resolvedPagination.pageIndex + 1,
								),
							)
						}
					>
						Next
					</Button>
					<Button
						type="button"
						variant="soft"
						size="1"
						disabled={!canGoNext}
						onClick={() => goToPage(Math.max(0, totalPages - 1))}
					>
						Last
					</Button>
				</Flex>
			</Flex>
		</Box>
	);
}
