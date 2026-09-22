import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { AlertTriangleIcon, HomeIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataGrid } from '@/components/inventory/data-grid';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { Pagination } from '@/components/inventory/pagination';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchInput } from '@/components/inventory/search-input';
import { SearchableSelect } from '@/components/inventory/searchable-select';
import { StockBadge } from '@/components/inventory/stock-badge';
import { StatusBadge } from '@/components/inventory/status-badge';
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryParams } from '@/hooks/use-query-params';
import { cn } from '@/lib/utils';
import categoriesRoute from '@/routes/categories';
import products from '@/routes/products';
import suppliersRoute from '@/routes/suppliers';
import type {
    Category,
    PaginatedData,
    Product,
    Supplier,
} from '@/types/inventory';

type ProductsIndexProps = {
    products: PaginatedData<Product>;
    categories: Category[];
    suppliers: Supplier[];
    filters: {
        search?: string;
        category_id?: string;
        supplier_id?: string;
        low_stock?: string;
        inactive?: string;
    };
    isAdmin: boolean;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export default function ProductsIndex({
    products: pagination,
    categories,
    suppliers,
    isAdmin,
}: ProductsIndexProps) {
    const [view, setView] = useLocalStorage<'list' | 'grid'>(
        'products-view',
        'list',
    );
    const [queryFilters, setQueryFilters, clearFilters] = useQueryParams<{
        search: string;
        category_id: string;
        supplier_id: string;
        low_stock: string;
        per_page: string;
    }>();
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

    const hasActiveFilters = Boolean(
        queryFilters.search || queryFilters.category_id || queryFilters.supplier_id || queryFilters.low_stock,
    );

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            setQueryFilters({ [key]: value === 'all' ? '' : value });
        },
        [setQueryFilters],
    );

    const categoryOptions = [
        { value: 'all', label: 'Todas las categorías' },
        ...categories.map((cat) => ({ value: String(cat.id), label: cat.name_category })),
    ];

    const supplierOptions = [
        { value: 'all', label: 'Todos los proveedores' },
        ...suppliers.map((sup) => ({ value: String(sup.id), label: sup.name_supplier })),
    ];

    function handleDelete() {
        if (!deleteProduct) return;
        router.delete(products.destroy.url(deleteProduct.id), {
            onError: () => setDeleteProduct(null),
        });
    }

    const columns: ColumnDef<StockFeatures, Product>[] = [
        {
            accessorKey: 'sku_product',
            header: 'SKU',
            meta: { className: 'w-28' },
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.sku_product}
                </span>
            ),
        },
        {
            accessorKey: 'name_product',
            header: 'Nombre',
            meta: { className: 'min-w-[180px]' },
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
            accessorKey: 'category.name_category',
            header: 'Categoría',
            meta: { className: 'min-w-[140px]' },
            cell: ({ row }) =>
                row.original.category ? (
                    <Link
                        href={categoriesRoute.show.url(row.original.category.id)}
                        className="hover:text-primary text-muted-foreground"
                    >
                        {row.original.category.name_category}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'supplier.name_supplier',
            header: 'Proveedor',
            meta: { className: 'min-w-[140px]' },
            cell: ({ row }) =>
                row.original.supplier ? (
                    <span className="text-muted-foreground">
                        {row.original.supplier.name_supplier}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        ...(isAdmin
            ? [
                  {
                      accessorKey: 'unit_price_product',
                      header: 'Precio',
                      meta: { className: 'w-28 text-right', headerClassName: 'text-right' },
                      cell: ({ row }) => (
                          <span>{formatCurrency(row.original.unit_price_product)}</span>
                      ),
                  },
              ]
            : []),
        {
            accessorKey: 'current_stock_product',
            header: 'Stock',
            meta: { className: 'w-32 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <StockBadge
                    currentStock={row.original.current_stock_product}
                    minimumStock={row.original.minimum_stock_product}
                />
            ),
        },
        {
            accessorKey: 'is_active_product',
            header: 'Estado',
            meta: { className: 'w-28 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <StatusBadge active={row.original.is_active_product} />
            ),
        },
        ...(isAdmin
            ? [
                  {
                      id: 'actions',
                      header: 'Acciones',
                      meta: { className: 'w-24 text-center', headerClassName: 'text-center' },
                      cell: ({ row }) => (
                          <div className="flex items-center justify-center gap-1">
                              <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      router.get(products.edit.url(row.original.id));
                                  }}
                              >
                                  <PencilIcon className="size-4" />
                                  <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteProduct(row.original);
                                  }}
                              >
                                  <Trash2Icon className="text-destructive size-4" />
                                  <span className="sr-only">Eliminar</span>
                              </Button>
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title="Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Productos"
                    description="Gestión de productos del inventario"
                >
                    {isAdmin && (
                        <Button asChild>
                            <Link href={products.create.url()}>
                                <PlusIcon className="size-4" />
                                Nuevo producto
                            </Link>
                        </Button>
                    )}
                </PageHeader>

                <FilterBar>
                    <SearchInput
                        value={queryFilters.search ?? ''}
                        onChange={(value) => handleFilterChange('search', value)}
                        placeholder="Buscar producto..."
                        className="w-full sm:w-72"
                    />
                    <SearchableSelect
                        options={categoryOptions}
                        value={queryFilters.category_id ?? 'all'}
                        onValueChange={(v) => handleFilterChange('category_id', v)}
                        placeholder="Categoría"
                        className="w-full sm:w-56"
                    />
                    <SearchableSelect
                        options={supplierOptions}
                        value={queryFilters.supplier_id ?? 'all'}
                        onValueChange={(v) => handleFilterChange('supplier_id', v)}
                        placeholder="Proveedor"
                        className="w-full sm:w-56"
                    />
                    <button
                        type="button"
                        aria-pressed={queryFilters.low_stock === '1'}
                        onClick={() =>
                            handleFilterChange('low_stock', queryFilters.low_stock === '1' ? '' : '1')
                        }
                        className={cn(
                            'inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring select-none',
                            queryFilters.low_stock === '1'
                                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 shadow-xs dark:text-amber-400'
                                : 'border-input bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                        )}
                    >
                        <AlertTriangleIcon
                            className={cn(
                                'size-3.5 shrink-0 transition-colors',
                                queryFilters.low_stock === '1'
                                    ? 'text-amber-500'
                                    : 'text-muted-foreground',
                            )}
                        />
                        Stock bajo
                        {queryFilters.low_stock === '1' && (
                            <span className="flex size-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_1px_rgb(245_158_11_/_0.6)]" />
                        )}
                    </button>
                    <ViewToggle view={view} onViewChange={setView} />
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </FilterBar>

                {view === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={pagination.data}
                        pagination={pagination}
                        showPerPage
                        onPerPageChange={(perPage) => setQueryFilters({ per_page: String(perPage) })}
                        emptyTitle="Sin productos"
                        emptyDescription="No se encontraron productos. Crea uno nuevo para comenzar."
                    emptyAction={
                        isAdmin
                            ? {
                                  label: 'Nuevo producto',
                                  href: products.create.url(),
                              }
                            : undefined
                    }
                    />
                ) : (
                    <div className="space-y-4">
                        {pagination.data.length === 0 ? (
                            <EmptyState
                                icon={PlusIcon}
                                title="Sin productos"
                                description="No se encontraron productos. Crea uno nuevo para comenzar."
                                action={
                                    isAdmin
                                        ? {
                                              label: 'Nuevo producto',
                                              href: products.create.url(),
                                          }
                                        : undefined
                                }
                            />
                        ) : (
                            <>
                                <DataGrid className="lg:grid-cols-3 xl:grid-cols-4">
                                    {pagination.data.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={products.show.url(product.id)}
                                        >
                                            <Card className="hover:border-primary/50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <span className="font-mono text-muted-foreground text-xs">
                                                                {product.sku_product}
                                                            </span>
                                                            <StatusBadge
                                                                active={product.is_active_product}
                                                            />
                                                        </div>
                                                        <h3 className="font-medium leading-tight">
                                                            {product.name_product}
                                                        </h3>
                                                        <p className="text-muted-foreground text-xs">
                                                            {product.category?.name_category ?? 'Sin categoría'}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2">
                                                            {isAdmin && (
                                                                <span className="font-bold">
                                                                    {formatCurrency(
                                                                        product.unit_price_product,
                                                                    )}
                                                                </span>
                                                            )}
                                                            <StockBadge
                                                                currentStock={
                                                                    product.current_stock_product
                                                                }
                                                                minimumStock={
                                                                    product.minimum_stock_product
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </DataGrid>
                                <Pagination
                                    data={pagination}
                                    showPerPage
                                    onPerPageChange={(perPage) =>
                                        setQueryFilters({ per_page: String(perPage) })
                                    }
                                />
                            </>
                        )}
                    </div>
                )}

                <ConfirmDialog
                    open={deleteProduct !== null}
                    onOpenChange={(open) => !open && setDeleteProduct(null)}
                    title="Eliminar producto"
                    description={
                        deleteProduct?.current_stock_product !== undefined &&
                        deleteProduct.current_stock_product > 0
                            ? `¿Estás seguro de eliminar "${deleteProduct?.name_product}"? Se perderá el registro de stock.`
                            : `¿Estás seguro de eliminar el producto "${deleteProduct?.name_product}"?`
                    }
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Productos', href: products.index.url() },
    ],
};
