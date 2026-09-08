import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { EmptyState } from '@/components/inventory/empty-state';
import { PageHeader } from '@/components/inventory/page-header';
import { StockBadge } from '@/components/inventory/stock-badge';
import categories from '@/routes/categories';
import products from '@/routes/products';
import suppliers from '@/routes/suppliers';
import type { Product, Supplier } from '@/types/inventory';

type SuppliersShowProps = {
    supplier: Supplier & {
        products?: Product[];
    };
};

export default function SuppliersShow({ supplier }: SuppliersShowProps) {
    const [showDelete, setShowDelete] = useState(false);

    function handleDelete() {
        router.delete(suppliers.destroy.url(supplier.id));
    }

    return (
        <>
            <Head title={supplier.name_supplier} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={supplier.name_supplier}
                    description={supplier.contact_name_supplier ?? 'Sin contacto registrado'}
                >
                    <Button variant="outline" asChild>
                        <Link href={suppliers.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
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
                            {!supplier.products || supplier.products.length === 0 ? (
                                <EmptyState
                                    icon={ArrowLeftIcon}
                                    title="Sin productos"
                                    description="Este proveedor no tiene productos asociados."
                                />
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead className="text-center">
                                                    Stock
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Estado
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {supplier.products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {product.sku_product}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={products.show.url(product.id)}
                                                            className="hover:text-primary font-medium"
                                                        >
                                                            {product.name_product}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={categories.show.url(
                                                                product.category_id,
                                                            )}
                                                            className="hover:text-primary text-muted-foreground"
                                                        >
                                                            {product.category?.name_category ??
                                                                '—'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {product.current_stock_product}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <StockBadge
                                                            currentStock={
                                                                product.current_stock_product
                                                            }
                                                            minimumStock={
                                                                product.minimum_stock_product
                                                            }
                                                            showValue={false}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proveedores', href: suppliers.index.url() },
    ],
};
