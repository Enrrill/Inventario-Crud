import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, DownloadIcon, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, HomeIcon, RefreshCw, XIcon } from 'lucide-react';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { StatCard } from '@/components/inventory/stat-card';
import { TypeBadge } from '@/components/inventory/type-badge';
import { useQueryParams } from '@/hooks/use-query-params';
import reports from '@/routes/reports';
import products from '@/routes/products';
import type { PaginatedData, StockMovement, StockMovementType } from '@/types/inventory';

type UserOption = { id: number; name: string };

type ReportsMovementsProps = {
    movements: PaginatedData<StockMovement>;
    summary: {
        total_movements: number;
        by_type: Array<{
            type_movement: StockMovementType;
            total: number;
            total_quantity: number;
        }>;
    };
    filters: { date_from?: string; date_to?: string; product_id?: string; type_movement?: string; user_id?: string; per_page?: string };
    users: UserOption[];
    isAdmin: boolean;
};

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium' }).format(new Date(date));

export default function ReportsMovements({
    movements,
    summary,
    filters,
    users,
    isAdmin,
}: ReportsMovementsProps) {
    const back = useBackNavigation(reports.index.url());
    const [queryFilters, setQueryFilters, clearFilters] = useQueryParams<{
        date_from: string;
        date_to: string;
        type_movement: string;
        product_id: string;
        user_id: string;
        per_page: string;
    }>();

    const hasActiveFilters = Boolean(
        queryFilters.date_from || queryFilters.date_to || queryFilters.type_movement || queryFilters.product_id || queryFilters.user_id,
    );

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            setQueryFilters({ [key]: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    function handleExport(type: string) {
        const params = new URLSearchParams();
        params.set('report', 'movements');
        const dateFrom = queryFilters.date_from || filters.date_from;
        const dateTo = queryFilters.date_to || filters.date_to;
        const prodId = queryFilters.product_id || filters.product_id;
        const typeMov = queryFilters.type_movement || filters.type_movement;
        const userId = queryFilters.user_id || filters.user_id;

        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (prodId && prodId !== 'all') params.set('product_id', prodId);
        if (typeMov && typeMov !== 'all') params.set('type_movement', typeMov);
        if (userId && userId !== 'all') params.set('user_id', userId);

        window.location.href = reports.export.url(type) + '?' + params.toString();
    }

    const hasData = movements.data.length > 0;

    const entrySummary = summary.by_type.find((t) => t.type_movement === 'entry');
    const exitSummary = summary.by_type.find((t) => t.type_movement === 'exit');
    const adjustmentSummary = summary.by_type.find((t) => t.type_movement === 'adjustment');

    const columns: ColumnDef<StockFeatures, StockMovement>[] = [
        {
            accessorKey: 'created_at',
            header: 'Fecha',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">{formatDate(row.original.created_at)}</span>
            ),
        },
        {
            accessorKey: 'product',
            header: 'Producto',
            cell: ({ row }) =>
                row.original.product ? (
                    <Link
                        href={products.show.url(row.original.product_id)}
                        className="hover:text-primary font-medium"
                    >
                        {row.original.product.name_product}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'type_movement',
            header: 'Tipo',
            cell: ({ row }) => <TypeBadge type={row.original.type_movement} />,
        },
        {
            accessorKey: 'quantity_movement',
            header: 'Cantidad',
            meta: { className: 'text-center' },
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.type_movement === 'exit' ? '-' : '+'}
                    {row.original.quantity_movement}
                </span>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Usuario',
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.user?.name ?? '—'}</span>
            ),
        },
    ];

    const userOptions = [
        { value: 'all', label: 'Todos los usuarios' },
        ...users.map((u) => ({ value: String(u.id), label: u.name })),
    ];

    return (
        <>
            <Head title="Reporte de Movimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Reporte de Movimientos"
                    description="Análisis de movimientos de entrada, salida y ajuste"
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('csv')} disabled={!hasData}>
                        <DownloadIcon className="size-4" />
                        CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!hasData}>
                        <DownloadIcon className="size-4" />
                        PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('xlsx')} disabled={!hasData}>
                        <DownloadIcon className="size-4" />
                        XLSX
                    </Button>
                </PageHeader>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Movimientos"
                        value={summary.total_movements}
                        icon={ArrowLeftRight}
                    />
                    <StatCard
                        title="Entradas"
                        value={entrySummary?.total ?? 0}
                        description={`${entrySummary?.total_quantity ?? 0} unidades`}
                        icon={ArrowDownCircle}
                    />
                    <StatCard
                        title="Salidas"
                        value={exitSummary?.total ?? 0}
                        description={`${exitSummary?.total_quantity ?? 0} unidades`}
                        icon={ArrowUpCircle}
                    />
                    <StatCard
                        title="Ajustes"
                        value={adjustmentSummary?.total ?? 0}
                        description={`${adjustmentSummary?.total_quantity ?? 0} unidades`}
                        icon={RefreshCw}
                    />
                </div>

                <FilterBar className="items-end">
                    <div className="space-y-1">
                        <Label className="text-xs">Desde</Label>
                        <Input
                            type="date"
                            value={queryFilters.date_from ?? ''}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Hasta</Label>
                        <Input
                            type="date"
                            value={queryFilters.date_to ?? ''}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <Select
                        value={queryFilters.type_movement ?? 'all'}
                        onValueChange={(v) => handleFilterChange('type_movement', v)}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="entry">Entradas</SelectItem>
                            <SelectItem value="exit">Salidas</SelectItem>
                            {isAdmin && <SelectItem value="adjustment">Ajustes</SelectItem>}
                        </SelectContent>
                    </Select>
                    {isAdmin && (
                        <SearchableSelect
                            options={userOptions}
                            value={queryFilters.user_id ?? 'all'}
                            onValueChange={(v) => handleFilterChange('user_id', v)}
                            placeholder="Todos los usuarios"
                            className="w-full sm:w-56"
                        />
                    )}
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={movements.data}
                    pagination={movements}
                    showPerPage
                    onPerPageChange={(perPage) => setQueryFilters({ per_page: String(perPage) })}
                    emptyTitle="Sin movimientos"
                    emptyDescription="No se encontraron movimientos con los filtros seleccionados."
                />
            </div>
        </>
    );
}

ReportsMovements.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Reportes', href: reports.index.url() },
        { title: 'Movimientos', href: '' },
    ],
};
