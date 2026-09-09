import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, DownloadIcon, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { StockBadge } from '@/components/inventory/stock-badge';
import { useQueryParams } from '@/hooks/use-query-params';
import products from '@/routes/products';
import reports from '@/routes/reports';
import type { Category, Product } from '@/types/inventory';

type ReportsStockStatusProps = {
    summary: {
        total_active: number;
        out_of_stock: Product[];
        low_stock: Product[];
        normal_stock: Product[];
        by_category: Record<string, {
            total: number;
            out_of_stock: number;
            low_stock: number;
        }>;
    };
    filters: { category_id?: string };
    categories: Category[];
};

export default function ReportsStockStatus({
    summary,
    filters,
    categories,
}: ReportsStockStatusProps) {
    const [queryFilters, setQueryFilters] = useQueryParams<{
        category_id: string;
    }>();

    const handleCategoryChange = useCallback(
        (value: string) => {
            setQueryFilters({ category_id: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    function handleExport(type: string) {
        const params = new URLSearchParams();
        params.set('report', 'stock-status');
        if (filters.category_id) params.set('category_id', filters.category_id);
        window.location.href = reports.export.url(type) + '?' + params.toString();
    }

    const hasData = summary.total_active > 0;

    const problemProducts = [...summary.out_of_stock, ...summary.low_stock];

    const columns: ColumnDef<StockFeatures, Product>[] = [
        {
            accessorKey: 'sku_product',
            header: 'SKU',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.sku_product}</span>
            ),
        },
        {
            accessorKey: 'name_product',
            header: 'Nombre',
            cell: ({ row }) => (
                <Link
                    href={products.show.url(row.original.id)}
                    className="hover:text-primary font-medium"
                >
                    {row.original.name_product}
                </Link>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Categoría',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.category?.name_category ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'current_stock_product',
            header: () => <span className="text-center">Stock Actual</span>,
            cell: ({ row }) => (
                <span className="block text-center font-medium">{row.original.current_stock_product}</span>
            ),
        },
        {
            accessorKey: 'minimum_stock_product',
            header: () => <span className="text-center">Stock Mínimo</span>,
            cell: ({ row }) => (
                <span className="block text-center">{row.original.minimum_stock_product}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-center">Estado</span>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <StockBadge
                        currentStock={row.original.current_stock_product}
                        minimumStock={row.original.minimum_stock_product}
                        showValue={false}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Estado de Stock" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Estado de Stock"
                    description="Resumen del estado del stock por categoría"
                >
                    <Button variant="outline" asChild>
                        <Link href={reports.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
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
                        title="Total Activos"
                        value={summary.total_active}
                        icon={Package}
                    />
                    <StatCard
                        title="Sin Stock"
                        value={summary.out_of_stock.length}
                        description="Requieren reabastecimiento urgente"
                        icon={XCircle}
                    />
                    <StatCard
                        title="Stock Bajo"
                        value={summary.low_stock.length}
                        description="Por debajo del mínimo"
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Stock Normal"
                        value={summary.normal_stock.length}
                        description="Con stock suficiente"
                        icon={CheckCircle}
                    />
                </div>

                <FilterBar>
                    <Select
                        value={queryFilters.category_id ?? 'all'}
                        onValueChange={handleCategoryChange}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name_category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FilterBar>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="size-4 text-red-600" />
                                Sin Stock ({summary.out_of_stock.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.out_of_stock.length === 0 ? (
                                <EmptyState
                                    icon={CheckCircle}
                                    title="Todo bien"
                                    description="No hay productos sin stock."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {summary.out_of_stock.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{product.name_product}</p>
                                                <p className="text-muted-foreground text-xs">{product.category?.name_category ?? '—'}</p>
                                            </div>
                                            <StockBadge currentStock={0} minimumStock={product.minimum_stock_product} showValue={false} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="size-4 text-amber-600" />
                                Stock Bajo ({summary.low_stock.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.low_stock.length === 0 ? (
                                <EmptyState
                                    icon={CheckCircle}
                                    title="Todo bien"
                                    description="No hay productos con stock bajo."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {summary.low_stock.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{product.name_product}</p>
                                                <p className="text-muted-foreground text-xs">{product.category?.name_category ?? '—'}</p>
                                            </div>
                                            <StockBadge currentStock={product.current_stock_product} minimumStock={product.minimum_stock_product} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Por Categoría</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(summary.by_category).length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="Sin datos"
                                    description="No hay datos de categorías."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(summary.by_category).map(([name, data]) => (
                                        <div key={name} className="border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{name}</p>
                                                <span className="text-muted-foreground text-sm">{data.total} total</span>
                                            </div>
                                            <div className="mt-1 flex gap-2">
                                                {data.out_of_stock > 0 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {data.out_of_stock} sin stock
                                                    </Badge>
                                                )}
                                                {data.low_stock > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {data.low_stock} bajo
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {problemProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos que Requieren Atención</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={problemProducts}
                                emptyTitle="Sin productos"
                                emptyDescription="No hay productos que requieran atención."
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ReportsStockStatus.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reportes', href: reports.index.url() },
        { title: 'Estado de Stock', href: '' },
    ],
};
