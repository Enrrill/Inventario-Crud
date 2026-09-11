import {
    useTable,
    flexRender,
    stockFeatures,
    type ColumnDef,
    type RowData,
    type StockFeatures,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/inventory/empty-state';
import { Pagination } from '@/components/inventory/pagination';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/inventory';
import type { LucideIcon } from 'lucide-react';

export type ColumnMeta = {
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
};

function DataTable<TData extends RowData, TValue>({
    columns,
    data,
    pagination,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    toolbar,
    emptyIcon,
    emptyTitle = 'Sin resultados',
    emptyDescription = 'No se encontraron registros.',
    emptyAction,
    loading = false,
    showPerPage = false,
    onPerPageChange,
    enablePagination = true,
    defaultPerPage = 10,
}: {
    columns: ColumnDef<StockFeatures, TData, TValue>[];
    data: TData[];
    pagination?: PaginatedData<TData>;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    toolbar?: React.ReactNode;
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: { label: string; href: string };
    loading?: boolean;
    showPerPage?: boolean;
    onPerPageChange?: (value: number) => void;
    enablePagination?: boolean;
    defaultPerPage?: number;
}) {
    const isServerPagination = pagination !== undefined;
    const [clientPage, setClientPage] = useState(1);
    const [clientPerPage, setClientPerPage] = useState(defaultPerPage);

    const clientTotalPages = Math.max(1, Math.ceil(data.length / clientPerPage));

    // Reset client page if data shrinks below current page
    const safeClientPage = Math.min(clientPage, clientTotalPages);

    const displayData = useMemo(() => {
        if (isServerPagination || !enablePagination) {
            return data;
        }
        const start = (safeClientPage - 1) * clientPerPage;
        return data.slice(start, start + clientPerPage);
    }, [isServerPagination, enablePagination, data, safeClientPage, clientPerPage]);

    const table = useTable({
        features: stockFeatures,
        data: displayData,
        columns: columns as ColumnDef<StockFeatures, TData>[],
        manualPagination: true,
        pageCount: isServerPagination ? pagination.last_page : clientTotalPages,
    });

    const clientPaginationData: PaginatedData<TData> | undefined = useMemo(() => {
        if (isServerPagination || !enablePagination) return undefined;
        return {
            data: displayData,
            current_page: safeClientPage,
            last_page: clientTotalPages,
            per_page: clientPerPage,
            total: data.length,
            from: data.length === 0 ? 0 : (safeClientPage - 1) * clientPerPage + 1,
            to: data.length === 0 ? 0 : Math.min(safeClientPage * clientPerPage, data.length),
            links: [],
        };
    }, [isServerPagination, enablePagination, displayData, safeClientPage, clientTotalPages, clientPerPage, data.length]);

    const showEmpty = !loading && data.length === 0;

    return (
        <div className="space-y-4" data-slot="data-table">
            {toolbar && <div>{toolbar}</div>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = (header.column.columnDef as { meta?: ColumnMeta }).meta;
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(meta?.className, meta?.headerClassName)}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : showEmpty ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <EmptyState
                                        icon={emptyIcon}
                                        title={emptyTitle}
                                        description={emptyDescription}
                                        action={emptyAction}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getAllCells().map((cell) => {
                                        const meta = (cell.column.columnDef as { meta?: ColumnMeta }).meta;
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(meta?.className, meta?.cellClassName)}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isServerPagination && pagination && (
                <Pagination
                    data={pagination}
                    showPerPage={showPerPage}
                    onPerPageChange={onPerPageChange}
                />
            )}

            {!isServerPagination && enablePagination && clientPaginationData && (
                <Pagination
                    data={clientPaginationData}
                    showPerPage={showPerPage}
                    onPageChange={(page) => setClientPage(page)}
                    onPerPageChange={(perPage) => {
                        setClientPerPage(perPage);
                        setClientPage(1);
                    }}
                />
            )}
        </div>
    );
}

export { DataTable };
