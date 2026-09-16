import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/inventory/page-header';
import { TypeBadge } from '@/components/inventory/type-badge';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import movements from '@/routes/movements';
import products from '@/routes/products';
import type { StockMovement } from '@/types/inventory';

type MovementsShowProps = {
    movement: StockMovement;
};

export default function MovementsShow({ movement }: MovementsShowProps) {
    const back = useBackNavigation(movements.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
            { title: 'Movimientos', href: movements.index.url() },
            { title: `Movimiento #${movement.id}`, href: movements.show.url(movement.id) },
        ],
    });

    const typeLabels: Record<string, string> = {
        entry: 'Entrada',
        exit: 'Salida',
        adjustment: 'Ajuste',
    };

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <>
            <Head title={`Movimiento #${movement.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={`Movimiento #${movement.id}`}
                    description={typeLabels[movement.type_movement]}
                >
                    <TypeBadge type={movement.type_movement} />
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Detalle</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Producto
                                </span>
                                <Link
                                    href={products.show.url(movement.product_id)}
                                    className="hover:text-primary font-medium"
                                >
                                    {movement.product?.name_product}
                                    <span className="text-muted-foreground ml-2 text-sm">
                                        ({movement.product?.sku_product})
                                    </span>
                                </Link>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo</span>
                                <TypeBadge type={movement.type_movement} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cantidad</span>
                                <span className="font-medium">
                                    {movement.type_movement === 'entry' ? '+' : movement.type_movement === 'exit' ? '-' : ''}
                                    {movement.quantity_movement}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Stock anterior
                                </span>
                                <span className="font-medium">
                                    {movement.previous_stock_movement}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Stock nuevo
                                </span>
                                <span className="font-medium">
                                    {movement.new_stock_movement}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Información</h3>
                        <div className="space-y-3">
                            {movement.reference_movement && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Referencia
                                    </span>
                                    <span className="font-medium">
                                        {movement.reference_movement}
                                    </span>
                                </div>
                            )}
                            {movement.notes_movement && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Notas</span>
                                    <span className="text-right font-medium">
                                        {movement.notes_movement}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Registrado por
                                </span>
                                <span className="font-medium">
                                    {movement.user?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha</span>
                                <span className="font-medium">
                                    {formatDate(movement.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

MovementsShow.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Movimientos', href: movements.index.url() },
        { title: 'Detalle', href: '' },
    ],
};
