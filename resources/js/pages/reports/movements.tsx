import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, DownloadIcon, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
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
import { StatCard } from '@/components/inventory/stat-card';
import { TypeBadge } from '@/components/inventory/type-badge';
import { useQueryParams } from '@/hooks/use-query-params';
import reports from '@/routes/reports';
import type { PaginatedData, StockMovement, StockMovementType } from '@/types/inventory';

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
    filters: { date_from?: string; date_to?: string; product_id?: string; type_movement?: string };
};

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium' }).format(new Date(date));

export default function ReportsMovements({
    movements,
    summary,
    filters,
}: ReportsMovementsProps) {
    const [queryFilters, setQueryFilters] = useQueryParams<{
        date_from: string;
        date_to: string;
        type_movement: string;
    }>();

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            setQueryFilters({ [key]: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    function handleExport(type: string) {
        const params = new URLSearchParams();
        params.set('report', 'movements');
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.type_movement) params.set('type_movement', filters.type_movement);
        window.location.href = reports.export.url(type) + '?' + params.toString();
    }

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
            cell: ({ row }) => (
                <span className="font-medium">{row.original.product?.name_product ?? '—'}</span>
            ),
        },
        {
            accessorKey: 'type_movement',
            header: 'Tipo',
            cell: ({ row }) => <TypeBadge type={row.original.type_movement} />,
        },
        {
            accessorKey: 'quantity_movement',
            header: () => <span className="text-center">Cantidad</span>,
            cell: ({ row }) => (
                <span className="block text-center font-medium">
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

    return (
        <>
            <Head title="Reporte de Movimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Reporte de Movimientos"
                    description="Análisis de movimientos de entrada, salida y ajuste"
                >
                    <Button variant="outline" asChild>
                        <Link href={reports.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('csv')}>
                        <DownloadIcon className="size-4" />
                        CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                        <DownloadIcon className="size-4" />
                        PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('xlsx')}>
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

                <FilterBar>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
                                <SelectItem value="adjustment">Ajustes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={movements.data}
                    pagination={movements}
                    emptyTitle="Sin movimientos"
                    emptyDescription="No se encontraron movimientos con los filtros seleccionados."
                />
            </div>
        </>
    );
}

ReportsMovements.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reportes', href: reports.index.url() },
        { title: 'Movimientos', href: '' },
    ],
};
