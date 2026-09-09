import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, DownloadIcon, Package, DollarSign, Tags } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
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
import type { Category, Product, Supplier } from '@/types/inventory';

type ReportsInventoryProps = {
    products: Product[];
    summary: {
        total_products: number;
        total_value: number;
        by_category: Record<string, { count: number; value: number }>;
        by_supplier: Record<string, { count: number; value: number }>;
    };
    filters: { category_id?: string; supplier_id?: string };
    categories: Category[];
    suppliers: Supplier[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

export default function ReportsInventory({
    products: productsList,
    summary,
    filters,
    categories,
    suppliers,
}: ReportsInventoryProps) {
    const [queryFilters, setQueryFilters] = useQueryParams<{
        category_id: string;
        supplier_id: string;
    }>();

    const handleCategoryChange = useCallback(
        (value: string) => {
            setQueryFilters({ category_id: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    const handleSupplierChange = useCallback(
        (value: string) => {
            setQueryFilters({ supplier_id: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    function handleExport(type: string) {
        const params = new URLSearchParams();
        params.set('report', 'inventory');
        if (filters.category_id) params.set('category_id', filters.category_id);
        if (filters.supplier_id) params.set('supplier_id', filters.supplier_id);
        window.location.href = reports.export.url(type) + '?' + params.toString();
    }

    const hasData = productsList.length > 0;

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
            accessorKey: 'supplier',
            header: 'Proveedor',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.supplier?.name_supplier ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'current_stock_product',
            header: () => <span className="text-center">Stock</span>,
            cell: ({ row }) => (
                <span className="block text-center">{row.original.current_stock_product}</span>
            ),
        },
        {
            accessorKey: 'unit_price_product',
            header: () => <span className="text-center">Precio</span>,
            cell: ({ row }) => (
                <span className="block text-center">{formatCurrency(row.original.unit_price_product)}</span>
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
            <Head title="Reporte de Inventario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Reporte de Inventario"
                    description="Detalle de productos, valor y distribución"
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total Productos"
                        value={summary.total_products}
                        icon={Package}
                    />
                    <StatCard
                        title="Valor Total"
                        value={formatCurrency(summary.total_value)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Categorías"
                        value={Object.keys(summary.by_category).length}
                        icon={Tags}
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
                    <Select
                        value={queryFilters.supplier_id ?? 'all'}
                        onValueChange={handleSupplierChange}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Todos los proveedores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los proveedores</SelectItem>
                            {suppliers.map((sup) => (
                                <SelectItem key={sup.id} value={String(sup.id)}>
                                    {sup.name_supplier}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FilterBar>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Por Categoría</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(summary.by_category).length === 0 ? (
                                <EmptyState
                                    icon={Tags}
                                    title="Sin datos"
                                    description="No hay datos de categorías para mostrar."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(summary.by_category).map(([name, data]) => (
                                        <div key={name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{name}</p>
                                                <p className="text-muted-foreground text-xs">{data.count} productos</p>
                                            </div>
                                            <span className="text-sm font-medium">{formatCurrency(data.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Por Proveedor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(summary.by_supplier).length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="Sin datos"
                                    description="No hay datos de proveedores para mostrar."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(summary.by_supplier).map(([name, data]) => (
                                        <div key={name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{name}</p>
                                                <p className="text-muted-foreground text-xs">{data.count} productos</p>
                                            </div>
                                            <span className="text-sm font-medium">{formatCurrency(data.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DataTable
                    columns={columns}
                    data={productsList}
                    emptyTitle="Sin productos"
                    emptyDescription="No se encontraron productos con los filtros seleccionados."
                />
            </div>
        </>
    );
}

ReportsInventory.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reportes', href: reports.index.url() },
        { title: 'Inventario', href: '' },
    ],
};
