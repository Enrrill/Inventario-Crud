import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import users from '@/routes/users';
import type { User } from '@/types/auth';

type UsersEditProps = {
    user: User;
};

export default function UsersEdit({ user }: UsersEditProps) {
    return (
        <>
            <Head title={`Editar ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Usuario"
                    description={`Editando "${user.name}"`}
                >
                    <Button variant="outline" asChild>
                        <Link href={users.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                </PageHeader>

                <div className="max-w-xl">
                    <Form
                        method="put"
                        action={users.update.url(user.id)}
                        onError={() => toast.error('Error al guardar los cambios. Verifica los datos.')}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Correo electrónico <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={user.email}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Nueva contraseña
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Dejar vacío para mantener actual"
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">
                                        Rol <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="role" defaultValue={user.role}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">Empleado</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={users.index.url()}>
                                            Cancelar
                                        </Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: users.index.url() },
        { title: 'Editar', href: '' },
    ],
};
