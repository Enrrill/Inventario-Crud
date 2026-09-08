import {
    useTable,
    createCoreRowModel,
    flexRender,
    type ColumnDef,
    type PaginationState,
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

function DataTable<TData, TValue>({
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
}: {
    columns: ColumnDef<TData, TValue>[];
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
}) {
    const table = useTable({
        data,
        columns,
        getCoreRowModel: createCoreRowModel(),
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
                                    {row.getVisibleCells().map((cell) => (
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

            {pagination && <Pagination data={pagination} />}
        </div>
    );
}

export { DataTable };
