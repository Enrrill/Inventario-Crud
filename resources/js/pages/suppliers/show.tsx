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
import suppliers from '@/routes/suppliers';
import type { Product, Supplier } from '@/types/inventory';

type SuppliersShowProps = {
    supplier: Supplier & {
        products?: Product[];
    };
    isAdmin: boolean;
};

export default function SuppliersShow({ supplier, isAdmin }: SuppliersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const back = useBackNavigation(suppliers.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
            { title: 'Proveedores', href: suppliers.index.url() },
            { title: supplier.name_supplier, href: suppliers.show.url(supplier.id) },
        ],
    });

    function handleDelete() {
        router.delete(suppliers.destroy.url(supplier.id));
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
            accessorKey: 'category',
            header: 'Categoría',
            cell: ({ row }) => (
                <Link
                    href={categories.show.url(row.original.category_id)}
                    className="hover:text-primary text-muted-foreground"
                >
                    {row.original.category?.name_category ?? '—'}
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
            <Head title={supplier.name_supplier} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={supplier.name_supplier}
                    description={supplier.contact_name_supplier ?? 'Sin contacto registrado'}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                    {isAdmin && (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={suppliers.edit.url(supplier.id)}>
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
                                <p className="font-medium">{supplier.name_supplier}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Contacto</p>
                                <p className="font-medium">
                                    {supplier.contact_name_supplier ?? '—'}
                                </p>
                            </div>
                            {isAdmin && (
                                <>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Email</p>
                                        <p className="font-medium">
                                            {supplier.email_supplier ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Teléfono</p>
                                        <p className="font-medium">
                                            {supplier.phone_supplier ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Dirección</p>
                                        <p className="font-medium">
                                            {supplier.address_supplier ?? '—'}
                                        </p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-muted-foreground text-sm">Productos</p>
                                <p className="font-medium">{supplier.products?.length ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                Productos ({supplier.products?.length ?? 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={productColumns}
                                data={supplier.products ?? []}
                                showPerPage
                                emptyTitle="Sin productos"
                                emptyDescription="Este proveedor no tiene productos asociados."
                            />
                        </CardContent>
                    </Card>
                </div>

                <ConfirmDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Eliminar proveedor"
                    description={
                        supplier.products_count
                            ? `No se puede eliminar "${supplier.name_supplier}" porque tiene productos asociados.`
                            : `¿Estás seguro de eliminar el proveedor "${supplier.name_supplier}"?`
                    }
                    confirmText="Eliminar"
                    variant={supplier.products_count ? 'default' : 'destructive'}
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

SuppliersShow.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Proveedores', href: suppliers.index.url() },
    ],
};
