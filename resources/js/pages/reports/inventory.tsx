import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, DownloadIcon, Package, DollarSign, Tags, XIcon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchableSelect } from '@/components/inventory/searchable-select';
import { StatCard } from '@/components/inventory/stat-card';
import { StockBadge } from '@/components/inventory/stock-badge';
import { useQueryParams } from '@/hooks/use-query-params';
import products from '@/routes/products';
import reports from '@/routes/reports';
import type { Category, PaginatedData, Product, Supplier } from '@/types/inventory';

type ReportsInventoryProps = {
    products: PaginatedData<Product>;
    summary: {
        total_products: number;
        total_value: number;
        by_category: Record<string, { count: number; value: number }>;
        by_supplier: Record<string, { count: number; value: number }>;
    };
    filters: { category_id?: string; supplier_id?: string; per_page?: string };
    categories: Category[];
    suppliers: Supplier[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

export default function ReportsInventory({
    products: productsPagination,
    summary,
    filters,
    categories,
    suppliers,
}: ReportsInventoryProps) {
    const [queryFilters, setQueryFilters, clearFilters] = useQueryParams<{
        category_id: string;
        supplier_id: string;
        per_page: string;
    }>();

    const hasActiveFilters = Boolean(queryFilters.category_id || queryFilters.supplier_id);

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
        const catId = queryFilters.category_id || filters.category_id;
        const supId = queryFilters.supplier_id || filters.supplier_id;
        if (catId && catId !== 'all') params.set('category_id', catId);
        if (supId && supId !== 'all') params.set('supplier_id', supId);
        
        window.location.href = reports.export.url(type) + '?' + params.toString();
    }

    const hasData = productsPagination.total > 0;

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

    const categoryOptions = [
        { value: 'all', label: 'Todas las categorías' },
        ...categories.map((cat) => ({ value: String(cat.id), label: cat.name_category })),
    ];

    const supplierOptions = [
        { value: 'all', label: 'Todos los proveedores' },
        ...suppliers.map((sup) => ({ value: String(sup.id), label: sup.name_supplier })),
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
                    <SearchableSelect
                        options={categoryOptions}
                        value={queryFilters.category_id ?? 'all'}
                        onValueChange={handleCategoryChange}
                        placeholder="Todas las categorías"
                        className="w-full sm:w-64"
                    />
                    <SearchableSelect
                        options={supplierOptions}
                        value={queryFilters.supplier_id ?? 'all'}
                        onValueChange={handleSupplierChange}
                        placeholder="Todos los proveedores"
                        className="w-full sm:w-64"
                    />
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
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
                    data={productsPagination.data}
                    pagination={productsPagination}
                    showPerPage
                    onPerPageChange={(perPage) => setQueryFilters({ per_page: String(perPage) })}
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
