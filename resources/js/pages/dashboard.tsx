import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    DollarSign,
    HomeIcon,
    Package,
    Tags,
    Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/inventory/empty-state';
import { PageHeader } from '@/components/inventory/page-header';
import { StatCard } from '@/components/inventory/stat-card';
import { StockBadge } from '@/components/inventory/stock-badge';
import { TypeBadge } from '@/components/inventory/type-badge';
import { DataGrid } from '@/components/inventory/data-grid';
import { dashboard } from '@/routes';
import movements from '@/routes/movements';
import products from '@/routes/products';
import type { DashboardStats, Product, StockMovement } from '@/types/inventory';

type DashboardProps = {
    stats: DashboardStats;
    recentMovements: StockMovement[];
    lowStockProducts: Product[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium' }).format(
        new Date(date),
    );

function DashboardSkeleton() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>

                <DataGrid className="xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={`stat-skeleton-${i}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="size-8 rounded-lg" />
                                </div>
                                <Skeleton className="mt-2 h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </DataGrid>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={`mov-skeleton-${i}`} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={`stock-skeleton-${i}`} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default function Dashboard({
    stats,
    recentMovements,
    lowStockProducts,
}: DashboardProps) {
    if (!stats) {
        return <DashboardSkeleton />;
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Dashboard"
                    description="Resumen general del sistema de inventario"
                />

                <DataGrid className="xl:grid-cols-5">
                    <StatCard
                        title="Total Productos"
                        value={stats.total_products}
                        icon={Package}
                    />
                    <StatCard
                        title="Stock Bajo"
                        value={stats.low_stock_products}
                        description="Requieren atención"
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Categorías"
                        value={stats.total_categories}
                        icon={Tags}
                    />
                    <StatCard
                        title="Proveedores"
                        value={stats.total_suppliers}
                        icon={Truck}
                    />
                    <StatCard
                        title="Valor del Inventario"
                        value={formatCurrency(stats.inventory_value)}
                        icon={DollarSign}
                    />
                </DataGrid>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Últimos Movimientos</CardTitle>
                            <Link
                                href={movements.index.url()}
                                className="text-muted-foreground hover:text-primary text-sm font-medium"
                            >
                                Ver todos
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentMovements.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="Sin movimientos"
                                    description="Aún no se han registrado movimientos de inventario."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {recentMovements.map((movement) => (
                                        <div
                                            key={movement.id}
                                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {movement.product
                                                        ?.name_product ??
                                                        'Producto eliminado'}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatDate(
                                                        movement.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex items-center gap-2">
                                                <TypeBadge
                                                    type={movement.type_movement}
                                                />
                                                <span className="text-muted-foreground text-sm">
                                                    {movement.type_movement ===
                                                    'exit'
                                                        ? '-'
                                                        : '+'}
                                                    {movement.quantity_movement}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Stock Bajo</CardTitle>
                            <Link
                                href={products.index.url()}
                                className="text-muted-foreground hover:text-primary text-sm font-medium"
                            >
                                Ver todos
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {lowStockProducts.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="Sin productos con stock bajo"
                                    description="Todos los productos tienen stock suficiente."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {lowStockProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {product.name_product}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {product.category
                                                        ?.name_category ??
                                                        'Sin categoría'}{' '}
                                                    · SKU: {product.sku_product}
                                                </p>
                                            </div>
                                            <StockBadge
                                                currentStock={
                                                    product.current_stock_product
                                                }
                                                minimumStock={
                                                    product.minimum_stock_product
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'StockNow',
            href: dashboard(),
            icon: HomeIcon,
        },
    ],
};
