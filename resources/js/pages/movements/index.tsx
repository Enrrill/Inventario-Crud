import { Head, Link, usePage } from '@inertiajs/react';
import { EyeIcon, HomeIcon, PlusIcon, XIcon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchableSelect } from '@/components/inventory/searchable-select';
import { TypeBadge } from '@/components/inventory/type-badge';
import { useQueryParams } from '@/hooks/use-query-params';
import movements from '@/routes/movements';
import productsRoute from '@/routes/products';
import type {
    PaginatedData,
    Product,
    StockMovement,
    StockMovementType,
} from '@/types/inventory';

type MovementsIndexProps = {
    movements: PaginatedData<StockMovement>;
    products: Product[];
    filters: {
        product_id?: string;
        type?: StockMovementType;
    };
};

export default function MovementsIndex({
    movements: pagination,
    products,
}: MovementsIndexProps) {
    const [filters, setFilters, clearFilters] = useQueryParams<{
        product_id: string;
        type: string;
        per_page: string;
    }>();
    const page = usePage();
    const filterTypes: StockMovementType[] = (page.props.filterTypes as StockMovementType[]) ?? [
        'entry',
        'exit',
        'adjustment',
    ];
    const typeLabels: Record<string, string> = {
        entry: 'Entrada',
        exit: 'Salida',
        adjustment: 'Ajuste',
    };

    const hasActiveFilters = Boolean(filters.product_id || filters.type);

    const handleFilter = useCallback(
        (key: string, value: string) => {
            setFilters({ [key]: value === 'all' ? '' : value } as Partial<{ product_id: string; type: string; per_page: string }>);
        },
        [setFilters],
    );

    const productOptions = [
        { value: 'all', label: 'Todos los productos' },
        ...products.map((p) => ({ value: String(p.id), label: p.name_product })),
    ];

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const columns: ColumnDef<StockFeatures, StockMovement>[] = [
        {
            accessorKey: 'created_at',
            header: 'Fecha',
            meta: { className: 'w-36' },
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {formatDate(row.original.created_at)}
                </span>
            ),
        },
        {
            accessorKey: 'product',
            header: 'Producto',
            meta: { className: 'min-w-[180px]' },
            cell: ({ row }) => (
                <Link
                    href={productsRoute.show.url(row.original.product_id)}
                    className="hover:text-primary font-medium"
                >
                    {row.original.product?.name_product}
                </Link>
            ),
        },
        {
            accessorKey: 'type_movement',
            header: 'Tipo',
            meta: { className: 'w-28 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => <TypeBadge type={row.original.type_movement} />,
        },
        {
            accessorKey: 'quantity_movement',
            header: 'Cantidad',
            meta: { className: 'w-24 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => {
                const m = row.original;
                const isEntry = m.type_movement === 'entry';
                const isExit = m.type_movement === 'exit';
                return (
                    <span
                        className={`font-medium ${
                            isEntry
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isExit
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-foreground'
                        }`}
                    >
                        {isEntry ? '+' : isExit ? '-' : ''}
                        {m.quantity_movement}
                    </span>
                );
            },
        },
        {
            accessorKey: 'previous_stock_movement',
            header: 'Stock Ant.',
            meta: { className: 'w-24 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.previous_stock_movement}
                </span>
            ),
        },
        {
            accessorKey: 'new_stock_movement',
            header: 'Stock Nuevo',
            meta: { className: 'w-24 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.new_stock_movement}
                </span>
            ),
        },
        {
            accessorKey: 'reference_movement',
            header: 'Ref.',
            meta: { className: 'min-w-[120px]' },
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.reference_movement ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Usuario',
            meta: { className: 'w-36' },
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.user?.name}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            meta: { className: 'w-20 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                    >
                        <Link href={movements.show.url(row.original.id)}>
                            <EyeIcon className="size-4" />
                            <span className="sr-only">Ver</span>
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Movimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Movimientos"
                    description="Registro de entradas, salidas y ajustes de stock"
                >
                    <Button asChild>
                        <Link href={movements.create.url()}>
                            <PlusIcon className="size-4" />
                            Nuevo movimiento
                        </Link>
                    </Button>
                </PageHeader>

                <FilterBar>
                    <SearchableSelect
                        options={productOptions}
                        value={filters.product_id ?? 'all'}
                        onValueChange={(v) => handleFilter('product_id', v)}
                        placeholder="Todos los productos"
                        className="w-full sm:w-64"
                    />

                    <Select
                        value={filters.type ?? 'all'}
                        onValueChange={(v) => handleFilter('type', v)}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {filterTypes.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {typeLabels[t]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={pagination.data}
                    pagination={pagination}
                    showPerPage
                    onPerPageChange={(perPage) => setFilters({ per_page: String(perPage) })}
                    emptyTitle="Sin movimientos"
                    emptyDescription="No se encontraron movimientos. Registra uno nuevo para comenzar."
                    emptyAction={{
                        label: 'Nuevo movimiento',
                        href: movements.create.url(),
                    }}
                />
            </div>
        </>
    );
}

MovementsIndex.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Movimientos', href: movements.index.url() },
    ],
};
