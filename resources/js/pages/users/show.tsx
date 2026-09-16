import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, HomeIcon, MailIcon, PencilIcon, ShieldIcon, Trash2Icon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { PageHeader } from '@/components/inventory/page-header';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import users from '@/routes/users';
import type { User, UserRole } from '@/types/auth';

type UsersShowProps = {
    user: User;
};

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <Badge
            variant={role === 'admin' ? 'default' : 'secondary'}
            className="capitalize"
        >
            {role === 'admin' ? 'Administrador' : 'Empleado'}
        </Badge>
    );
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function UsersShow({ user }: UsersShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const back = useBackNavigation(users.index.url());

    setLayoutProps({
        breadcrumbs: [
            { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
            { title: 'Usuarios', href: users.index.url() },
            { title: user.name, href: users.show.url(user.id) },
        ],
    });

    function handleDelete() {
        router.delete(users.destroy.url(user.id));
    }

    return (
        <>
            <Head title={user.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title={user.name}
                    description={user.email}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={users.edit.url(user.id)}>
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
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-full text-2xl font-semibold">
                                    {getInitials(user.name)}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                    <RoleBadge role={user.role} />
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center gap-3">
                                    <MailIcon className="text-muted-foreground size-4" />
                                    <div>
                                        <p className="text-muted-foreground text-xs">Correo</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldIcon className="text-muted-foreground size-4" />
                                    <div>
                                        <p className="text-muted-foreground text-xs">Rol</p>
                                        <RoleBadge role={user.role} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="text-muted-foreground size-4" />
                                    <div>
                                        <p className="text-muted-foreground text-xs">Creado</p>
                                        <p className="font-medium">
                                            {new Date(user.created_at).toLocaleDateString('es-VE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {user.email_verified_at && (
                                    <div className="flex items-center gap-3">
                                        <MailIcon className="text-muted-foreground size-4" />
                                        <div>
                                            <p className="text-muted-foreground text-xs">Verificado</p>
                                            <p className="font-medium">
                                                {new Date(user.email_verified_at).toLocaleDateString('es-VE', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-muted-foreground text-sm">Estado</p>
                                        <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                            {user.email_verified_at ? 'Verificado' : 'Sin verificar'}
                                        </Badge>
                                    </div>
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-muted-foreground text-sm">2FA</p>
                                        <Badge variant={user.two_factor_enabled ? 'default' : 'secondary'}>
                                            {user.two_factor_enabled ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-muted-foreground text-sm">Rol</p>
                                        <RoleBadge role={user.role} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ConfirmDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    title="Eliminar usuario"
                    description={`¿Estás seguro de eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

UsersShow.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Usuarios', href: users.index.url() },
    ],
};
