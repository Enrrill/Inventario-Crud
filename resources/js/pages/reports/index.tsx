import { Head, Link } from '@inertiajs/react';
import { ArrowDownCircle, ArrowLeftRight, BarChart3, HomeIcon, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/inventory/page-header';
import reports from '@/routes/reports';

type ReportsIndexProps = {
    isAdmin: boolean;
};

export default function ReportsIndex({ isAdmin }: ReportsIndexProps) {
    const reportTypes = [
        ...(isAdmin
            ? [
                  {
                      title: 'Reporte de Inventario',
                      description: 'Consulta detallada de todos los productos, su valor y distribución por categoría y proveedor.',
                      icon: Package,
                      href: reports.inventory.url(),
                      color: 'text-blue-600 dark:text-blue-400',
                      bg: 'bg-blue-50 dark:bg-blue-900/20',
                  },
              ]
            : []),
        {
            title: 'Reporte de Movimientos',
            description: 'Análisis de movimientos de entrada, salida y ajuste con filtros por fecha y tipo.',
            icon: ArrowLeftRight,
            href: reports.movements.url(),
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            title: 'Estado de Stock',
            description: 'Resumen del estado del stock: productos sin stock, con stock bajo y stock normal por categoría.',
            icon: BarChart3,
            href: reports.stockStatus.url(),
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
    ];

    return (
        <>
            <Head title="Reportes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Reportes"
                    description="Genera y consulta reportes del sistema de inventario"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reportTypes.map((report) => (
                        <Link key={report.title} href={report.href}>
                            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                                <CardHeader>
                                    <div className={`mb-2 flex size-10 items-center justify-center rounded-lg ${report.bg}`}>
                                        <report.icon className={`size-5 ${report.color}`} />
                                    </div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm">
                                        {report.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Reportes', href: reports.index.url() },
    ],
};
