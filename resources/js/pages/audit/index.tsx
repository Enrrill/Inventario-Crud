import { Head, router } from '@inertiajs/react';
import { EyeIcon, ClipboardList, HomeIcon, XIcon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { useQueryParams } from '@/hooks/use-query-params';
import audit from '@/routes/audit';
import type { AuditEvent, AuditLog, PaginatedData } from '@/types/inventory';

type AuditIndexProps = {
    logs: PaginatedData<AuditLog>;
    filters: {
        user_id?: string;
        auditable_type?: string;
        event?: string;
        date_from?: string;
        date_to?: string;
    };
};

const eventConfig: Record<AuditEvent, { label: string; className: string }> = {
    created: {
        label: 'Creado',
        className: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    updated: {
        label: 'Actualizado',
        className: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    },
    deleted: {
        label: 'Eliminado',
        className: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    },
};

function EventBadge({ event }: { event: AuditEvent }) {
    const config = eventConfig[event] ?? { label: event, className: '' };
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}

const formatDateTime = (date: string) =>
    new Intl.DateTimeFormat('es-VE', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date));

function getModelName(type: string): string {
    const parts = type.split('\\');
    const name = parts[parts.length - 1];
    const map: Record<string, string> = {
        User: 'Usuario',
        Product: 'Producto',
        Category: 'Categoría',
        Supplier: 'Proveedor',
        StockMovement: 'Movimiento',
    };
    return map[name] ?? name;
}

export default function AuditIndex({ logs, filters }: AuditIndexProps) {
    const [queryFilters, setQueryFilters, clearFilters] = useQueryParams<{
        event: string;
        auditable_type: string;
        date_from: string;
        date_to: string;
        per_page: string;
    }>();

    const hasActiveFilters = Boolean(
        queryFilters.event || queryFilters.auditable_type || queryFilters.date_from || queryFilters.date_to,
    );

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            setQueryFilters({ [key]: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    const columns: ColumnDef<StockFeatures, AuditLog>[] = [
        {
            accessorKey: 'created_at',
            header: 'Fecha',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDateTime(row.original.created_at)}
                </span>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Usuario',
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.user?.name ?? 'Sistema'}
                </span>
            ),
        },
        {
            accessorKey: 'auditable_type',
            header: 'Modelo',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {getModelName(row.original.auditable_type)}
                </span>
            ),
        },
        {
            accessorKey: 'event',
            header: 'Evento',
            cell: ({ row }) => (
                <EventBadge event={row.original.event as AuditEvent} />
            ),
        },
        {
            accessorKey: 'ip_address',
            header: 'IP',
            cell: ({ row }) => (
                <span className="text-muted-foreground font-mono text-sm">
                    {row.original.ip_address ?? '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            meta: { className: 'text-center' },
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.get(audit.show.url(row.original.id));
                        }}
                    >
                        <EyeIcon className="size-4" />
                        <span className="sr-only">Ver detalle</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Auditoría" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Auditoría"
                    description="Registro de actividad del sistema"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Total Registros"
                        value={logs.total}
                        icon={ClipboardList}
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
                        value={queryFilters.event ?? 'all'}
                        onValueChange={(v) => handleFilterChange('event', v)}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Todos los eventos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los eventos</SelectItem>
                            <SelectItem value="created">Creado</SelectItem>
                            <SelectItem value="updated">Actualizado</SelectItem>
                            <SelectItem value="deleted">Eliminado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={queryFilters.auditable_type ?? 'all'}
                        onValueChange={(v) => handleFilterChange('auditable_type', v)}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Todos los modelos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los modelos</SelectItem>
                            <SelectItem value="App\Models\User">Usuario</SelectItem>
                            <SelectItem value="App\Models\Product">Producto</SelectItem>
                            <SelectItem value="App\Models\Category">Categoría</SelectItem>
                            <SelectItem value="App\Models\Supplier">Proveedor</SelectItem>
                            <SelectItem value="App\Models\StockMovement">Movimiento</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={logs.data}
                    pagination={logs}
                    showPerPage
                    onPerPageChange={(perPage) => setQueryFilters({ per_page: String(perPage) })}
                    emptyTitle="Sin registros"
                    emptyDescription="No se encontraron registros de auditoría con los filtros seleccionados."
                />
            </div>
        </>
    );
}

AuditIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { title: 'Auditoría', href: audit.index.url() },
    ],
};
