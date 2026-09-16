import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { HomeIcon, Mail, User } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Perfil" />

            <h1 className="sr-only">Perfil</h1>

            <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full text-xl font-semibold">
                            {getInitials(auth.user.name)}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{auth.user.name}</h2>
                            <p className="text-muted-foreground text-sm">{auth.user.email}</p>
                            <span className="bg-primary/10 text-primary mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                                {auth.user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-medium">Información Personal</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Actualiza tu nombre y dirección de correo electrónico
                    </p>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <div className="relative">
                                        <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                        <Input
                                            id="name"
                                            className="pl-9"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <div className="relative">
                                        <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="text-muted-foreground -mt-4 text-sm">
                                                Tu correo electrónico no está verificado.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Haz clic aquí para reenviar el
                                                    correo de verificación.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Se ha enviado un nuevo enlace de verificación
                                                    a tu correo electrónico.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Perfil', href: edit() },
    ],
};
