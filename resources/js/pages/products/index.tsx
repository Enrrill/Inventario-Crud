import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataGrid } from '@/components/inventory/data-grid';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { Pagination } from '@/components/inventory/pagination';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchInput } from '@/components/inventory/search-input';
import { StockBadge } from '@/components/inventory/stock-badge';
import { StatusBadge } from '@/components/inventory/status-badge';
import { ViewToggle } from '@/components/inventory/view-toggle';
import { useLocalStorage } from '@/hooks/use-local-storage';
import products from '@/routes/products';
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
};

const UNIDADES = [
    'Pieza',
    'Kilogramo',
    'Litro',
    'Metro',
    'Caja',
    'Par',
    'Juego',
];

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
    filters,
}: ProductsIndexProps) {
    const [view, setView] = useLocalStorage<'list' | 'grid'>(
        'products-view',
        'list',
    );
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

    function applyFilters(overrides: Record<string, string | undefined>) {
        const params: Record<string, string> = {};
        const merged = { ...filters, ...overrides };

        for (const [key, value] of Object.entries(merged)) {
            if (value && value !== '' && value !== 'all') {
                params[key] = value;
            }
        }

        router.get(products.index.url(), params, {
            preserveScroll: true,
            preserveState: true,
        });
    }

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
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.sku_product}
                </span>
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
            accessorKey: 'category.name_category',
            header: 'Categoría',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.category?.name_category ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'supplier.name_supplier',
            header: 'Proveedor',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.supplier?.name_supplier ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'unit_price_product',
            header: () => <span className="text-right">Precio</span>,
            cell: ({ row }) => (
                <span className="text-right">
                    {formatCurrency(row.original.unit_price_product)}
                </span>
            ),
        },
        {
            accessorKey: 'current_stock_product',
            header: () => <span className="text-center">Stock</span>,
            cell: ({ row }) => (
                <StockBadge
                    currentStock={row.original.current_stock_product}
                    minimumStock={row.original.minimum_stock_product}
                />
            ),
        },
        {
            accessorKey: 'is_active_product',
            header: () => <span className="text-center">Estado</span>,
            cell: ({ row }) => (
                <StatusBadge
                    active={row.original.is_active_product}
                    className="justify-center"
                />
            ),
        },
        {
            id: 'actions',
            header: () => <span className="text-center">Acciones</span>,
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
    ];

    return (
        <>
            <Head title="Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Productos"
                    description="Gestión de productos del inventario"
                >
                    <Button asChild>
                        <Link href={products.create.url()}>
                            <PlusIcon className="size-4" />
                            Nuevo producto
                        </Link>
                    </Button>
                </PageHeader>

                <FilterBar>
                    <SearchInput
                        value={filters.search ?? ''}
                        onChange={(value) => applyFilters({ search: value })}
                        placeholder="Buscar producto..."
                        className="w-full sm:w-80"
                    />
                    <Select
                        value={filters.category_id ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({ category_id: value })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Categoría" />
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
                        value={filters.supplier_id ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({ supplier_id: value })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Proveedor" />
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
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={filters.low_stock === '1'}
                            onChange={(e) =>
                                applyFilters({
                                    low_stock: e.target.checked ? '1' : undefined,
                                })
                            }
                            className="border-input rounded"
                        />
                        Stock bajo
                    </label>
                    <ViewToggle view={view} onViewChange={setView} />
                </FilterBar>

                {view === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={pagination.data}
                        pagination={pagination}
                        emptyTitle="Sin productos"
                        emptyDescription="No se encontraron productos. Crea uno nuevo para comenzar."
                        emptyAction={{
                            label: 'Nuevo producto',
                            href: products.create.url(),
                        }}
                    />
                ) : (
                    <div className="space-y-4">
                        {pagination.data.length === 0 ? (
                            <EmptyState
                                icon={PlusIcon}
                                title="Sin productos"
                                description="No se encontraron productos. Crea uno nuevo para comenzar."
                                action={{
                                    label: 'Nuevo producto',
                                    href: products.create.url(),
                                }}
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
                                                            <span className="font-bold">
                                                                {formatCurrency(
                                                                    product.unit_price_product,
                                                                )}
                                                            </span>
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
                                <Pagination data={pagination} />
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: products.index.url() },
    ],
};
