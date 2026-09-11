import {
    useTable,
    flexRender,
    stockFeatures,
    type ColumnDef,
    type RowData,
    type StockFeatures,
} from '@tanstack/react-table';
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
import type { PaginatedData } from '@/types/inventory';
import type { LucideIcon } from 'lucide-react';

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
}) {
    const table = useTable({
        features: stockFeatures,
        data,
        columns: columns as ColumnDef<StockFeatures, TData>[],
        manualPagination: true,
        pageCount: pagination?.last_page ?? 1,
    });

    const showEmpty = !loading && data.length === 0;

    return (
        <div className="space-y-4">
            {toolbar && <div>{toolbar}</div>}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={(header.column.columnDef as ColumnDef<StockFeatures, TData> & { meta?: { className?: string } }).meta?.className}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
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
                                    {row.getAllCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && (
                <Pagination
                    data={pagination}
                    showPerPage={showPerPage}
                    onPerPageChange={onPerPageChange}
                />
            )}
        </div>
    );
}

export { DataTable };
