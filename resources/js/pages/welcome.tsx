import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, ClipboardList, FileText, Package } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

export default function Welcome() {
    const { auth, name } = usePage().props;

    const features = [
        {
            icon: Package,
            title: 'Control de productos',
            description: 'Gestiona tu catálogo de productos de forma centralizada',
        },
        {
            icon: BarChart3,
            title: 'Gestión de stock',
            description: 'Monitorea entradas, salidas y ajustes de inventario en tiempo real',
        },
        {
            icon: FileText,
            title: 'Reportes detallados',
            description: 'Genera reportes de inventario, movimientos y estado de stock',
        },
        {
            icon: ClipboardList,
            title: 'Registro de actividad',
            description: 'Audita todas las acciones realizadas en el sistema',
        },
    ];

    return (
        <>
            <Head title="Bienvenido" />
            <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
                </div>

                <div className="w-full max-w-lg">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                                <AppLogoIcon className="text-primary size-9 fill-current" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    {name || 'Sistema de Inventario'}
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Gestiona tu inventario de forma eficiente y profesional
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            {auth.user ? (
                                <Button className="w-full" asChild>
                                    <Link href={dashboard()}>Ir al panel</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button className="w-full" asChild>
                                        <Link href={login()}>Iniciar sesión</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={register()}>Crear cuenta</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="w-full">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="rounded-lg border bg-card p-4"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                                                <feature.icon className="text-primary size-4" />
                                            </div>
                                            <h3 className="text-sm font-medium">
                                                {feature.title}
                                            </h3>
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-muted-foreground text-xs">
                            Sistema de inventario
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Welcome.layout = {
    title: 'Bienvenido',
    description: 'Sistema de gestión de inventario',
};
