import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CalendarIcon,
    GlobeIcon,
    HomeIcon,
    LayersIcon,
    MonitorIcon,
    UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/inventory/page-header';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import audit from '@/routes/audit';
import type { AuditEvent, AuditLog } from '@/types/inventory';

type AuditShowProps = {
    log: AuditLog;
    batchSiblings?: AuditLog[];
};

const eventConfig: Record<AuditEvent, { label: string; className: string }> = {
    created: {
        label: 'Creado',
        className: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    updated: {
        label: 'Actualizado',
        className: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    },
    deleted: {
        label: 'Eliminado',
        className: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    },
};

function EventBadge({ event }: { event: AuditEvent }) {
    const config = eventConfig[event] ?? { label: event, className: '' };
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}

function getModelName(type: string): string {
    const parts = type.split('\\');
    const name = parts[parts.length - 1];
    const map: Record<string, string> = {
        User: 'Usuario',
        Product: 'Producto',
        Category: 'Categoría',
        Supplier: 'Proveedor',
        StockMovement: 'Movimiento',
    };
    return map[name] ?? name;
}

const formatDateTime = (date: string) =>
    new Intl.DateTimeFormat('es-VE', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(new Date(date));

function JsonViewer({ data, title }: { data: Record<string, unknown> | null; title: string }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h4>
                <p className="text-muted-foreground text-sm">Sin datos</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h4>
            <div className="rounded-lg border bg-muted/50 p-4">
                <pre className="overflow-x-auto text-sm">
                    <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
            </div>
        </div>
    );
}

export default function AuditShow({ log, batchSiblings = [] }: AuditShowProps) {
    const back = useBackNavigation(audit.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard', icon: HomeIcon },
            { title: 'Auditoría', href: audit.index.url() },
            { title: `Registro #${log.id}`, href: audit.show.url(log.id) },
        ],
    });

    return (
        <>
            <Head title={`Auditoría #${log.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={`Registro de Auditoría #${log.id}`}
                    description={`${getModelName(log.auditable_type)} — ${log.event}`}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Información del Registro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <UserIcon className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Usuario</p>
                                    <p className="font-medium">{log.user?.name ?? 'Sistema'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Fecha y Hora</p>
                                    <p className="font-medium">{formatDateTime(log.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Dirección IP</p>
                                    <p className="font-mono font-medium">{log.ip_address ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MonitorIcon className="text-muted-foreground size-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">User Agent</p>
                                    <p className="text-muted-foreground line-clamp-3 text-xs">
                                        {log.user_agent ?? '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Modelo</p>
                                        <p className="font-medium">{getModelName(log.auditable_type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">ID del Registro</p>
                                        <p className="font-mono font-medium">#{log.auditable_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Evento</p>
                                        <EventBadge event={log.event as AuditEvent} />
                                    </div>
                                </div>
                            </div>

                            {log.batch_id && (
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2">
                                        <LayersIcon className="size-4 text-violet-600 dark:text-violet-400" />
                                        <div>
                                            <p className="text-muted-foreground text-xs">Lote</p>
                                            <p className="font-mono text-sm font-medium">{log.batch_id}</p>
                                        </div>
                                    </div>
                                    {batchSiblings.length > 1 && (
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            Parte de un lote con {batchSiblings.length} registros
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cambios Realizados</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <JsonViewer data={log.old_values} title="Valores Anteriores" />
                                <JsonViewer data={log.new_values} title="Valores Nuevos" />
                            </CardContent>
                        </Card>

                        {(log.event === 'created' || log.event === 'deleted') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle> Datos del Registro</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <JsonViewer
                                        data={log.event === 'created' ? log.new_values : log.old_values}
                                        title={log.event === 'created' ? 'Datos Creados' : 'Datos Eliminados'}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {batchSiblings.length > 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LayersIcon className="size-4 text-violet-600 dark:text-violet-400" />
                                        Registros del Mismo Lote
                                        <Badge variant="secondary" className="text-xs">
                                            {batchSiblings.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {batchSiblings.map((sibling) => (
                                            <div
                                                key={sibling.id}
                                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                                                    sibling.id === log.id
                                                        ? 'bg-muted/80 font-medium'
                                                        : 'hover:bg-muted/50 cursor-pointer'
                                                }`}
                                                onClick={() => {
                                                    if (sibling.id !== log.id) {
                                                        router.get(audit.show.url(sibling.id));
                                                    }
                                                }}
                                            >
                                                <EventBadge event={sibling.event as AuditEvent} />
                                                <span className="text-sm">
                                                    {getModelName(sibling.auditable_type)}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    #{sibling.auditable_id}
                                                </span>
                                                {sibling.id === log.id && (
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        Actual
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AuditShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { title: 'Auditoría', href: audit.index.url() },
    ],
};
