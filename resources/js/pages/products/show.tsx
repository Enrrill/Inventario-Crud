import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { PageHeader } from '@/components/inventory/page-header';
import { StockBadge } from '@/components/inventory/stock-badge';
import { StatusBadge } from '@/components/inventory/status-badge';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import categories from '@/routes/categories';
import products from '@/routes/products';
import suppliers from '@/routes/suppliers';
import type { Product } from '@/types/inventory';

type ProductsShowProps = {
    product: Product & {
        category?: { id: number; name_category: string };
        supplier?: { id: number; name_supplier: string };
    };
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export default function ProductsShow({ product }: ProductsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const back = useBackNavigation(products.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard', icon: HomeIcon },
            { title: 'Productos', href: products.index.url() },
            { title: product.name_product, href: products.show.url(product.id) },
        ],
    });

    function handleDelete() {
        router.delete(products.destroy.url(product.id));
    }

    return (
        <>
            <Head title={product.name_product} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={product.name_product}
                    description={`SKU: ${product.sku_product}`}
                >
                    <StatusBadge active={product.is_active_product} />
                    <StockBadge
                        currentStock={product.current_stock_product}
                        minimumStock={product.minimum_stock_product}
                    />
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={products.edit.url(product.id)}>
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
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Detalle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            SKU
                                        </p>
                                        <p className="font-mono font-medium">
                                            {product.sku_product}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Nombre
                                        </p>
                                        <p className="font-medium">
                                            {product.name_product}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Descripción
                                        </p>
                                        <p className="font-medium">
                                            {product.description_product ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Categoría
                                        </p>
                                        <p className="font-medium">
                                            {product.category ? (
                                                <Link
                                                    href={categories.show.url(
                                                        product.category.id,
                                                    )}
                                                    className="hover:text-primary"
                                                >
                                                    {product.category.name_category}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Proveedor
                                        </p>
                                        <p className="font-medium">
                                            {product.supplier ? (
                                                <Link
                                                    href={suppliers.show.url(
                                                        product.supplier.id,
                                                    )}
                                                    className="hover:text-primary"
                                                >
                                                    {product.supplier.name_supplier}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Precio unitario
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(product.unit_price_product)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Unidad de medida
                                        </p>
                                        <p className="font-medium">
                                            {product.unit_of_measure_product}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Stock mínimo
                                        </p>
                                        <p className="font-medium">
                                            {product.minimum_stock_product}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Stock actual
                                        </p>
                                        <p className="font-medium">
                                            {product.current_stock_product}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Estado
                                        </p>
                                        <StatusBadge active={product.is_active_product} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Nivel de Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                    Stock actual
                                </p>
                                <p className="text-4xl font-bold">
                                    {product.current_stock_product}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {product.unit_of_measure_product}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                    Stock mínimo
                                </p>
                                <p className="text-xl font-semibold">
                                    {product.minimum_stock_product}
                                </p>
                            </div>
                            <div className="text-center">
                                <StockBadge
                                    currentStock={product.current_stock_product}
                                    minimumStock={product.minimum_stock_product}
                                    showValue={false}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                    Valor en inventario
                                </p>
                                <p className="text-xl font-bold">
                                    {formatCurrency(
                                        product.current_stock_product *
                                            product.unit_price_product,
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <ConfirmDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Eliminar producto"
                    description={`¿Estás seguro de eliminar el producto "${product.name_product}"?`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

ProductsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { title: 'Productos', href: products.index.url() },
    ],
};
