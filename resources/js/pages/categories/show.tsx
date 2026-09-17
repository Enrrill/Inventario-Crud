import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { PageHeader } from '@/components/inventory/page-header';
import { StockBadge } from '@/components/inventory/stock-badge';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import categories from '@/routes/categories';
import products from '@/routes/products';
import type { Category, Product } from '@/types/inventory';

type CategoriesShowProps = {
    category: Category & {
        parent?: Category | null;
        children?: Category[];
        products?: Product[];
    };
    isAdmin: boolean;
};

export default function CategoriesShow({ category, isAdmin }: CategoriesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const back = useBackNavigation(categories.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
            { title: 'Categorías', href: categories.index.url() },
            { title: category.name_category, href: categories.show.url(category.id) },
        ],
    });

    function handleDelete() {
        router.delete(categories.destroy.url(category.id));
    }

    const productColumns: ColumnDef<StockFeatures, Product>[] = [
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
            accessorKey: 'current_stock_product',
            header: 'Stock',
            meta: { className: 'text-center' },
            cell: ({ row }) => <span>{row.original.current_stock_product}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            meta: { className: 'text-center' },
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
            <Head title={category.name_category} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={category.name_category}
                    description={category.description_category ?? 'Sin descripción'}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                    {isAdmin && (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={categories.edit.url(category.id)}>
                                    <PencilIcon className="size-4" />
                                    Editar
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2Icon className="text-destructive size-4" />
                                Eliminar
                            </Button>
                        </>
                    )}
                </PageHeader>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Detalle</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm">Nombre</p>
                                <p className="font-medium">{category.name_category}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Descripción</p>
                                <p className="font-medium">
                                    {category.description_category ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Categoría padre</p>
                                <p className="font-medium">
                                    {category.parent ? (
                                        <Link
                                            href={categories.show.url(category.parent.id)}
                                            className="hover:text-primary"
                                        >
                                            {category.parent.name_category}
                                        </Link>
                                    ) : (
                                        '—'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Subcategorías</p>
                                <p className="font-medium">{category.children?.length ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Productos</p>
                                <p className="font-medium">{category.products?.length ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>
                                    Subcategorías ({category.children?.length ?? 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!category.children || category.children.length === 0 ? (
                                    <EmptyState
                                        icon={ArrowLeftIcon}
                                        title="Sin subcategorías"
                                        description="Esta categoría no tiene subcategorías."
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={categories.show.url(child.id)}
                                                className="hover:bg-muted flex items-center justify-between rounded-lg border p-3 transition-colors"
                                            >
                                                <span className="font-medium">
                                                    {child.name_category}
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    {child.products_count} productos
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>
                                    Productos ({category.products?.length ?? 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={productColumns}
                                    data={category.products ?? []}
                                    showPerPage
                                    emptyTitle="Sin productos"
                                    emptyDescription="Esta categoría no tiene productos asociados."
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ConfirmDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Eliminar categoría"
                    description={`¿Estás seguro de eliminar la categoría "${category.name_category}"? Los productos se moverán a "Sin categoría".`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

CategoriesShow.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Categorías', href: categories.index.url() },
    ],
};
