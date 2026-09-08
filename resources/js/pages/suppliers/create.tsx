import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import suppliers from '@/routes/suppliers';

export default function SuppliersCreate() {
    return (
        <>
            <Head title="Nuevo Proveedor" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Nuevo Proveedor"
                    description="Registra un nuevo proveedor para el inventario"
                >
                    <Button variant="outline" asChild>
                        <Link href={suppliers.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                </PageHeader>

                <div className="max-w-xl">
                    <Form
                        method="post"
                        action={suppliers.store.url()}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name_supplier">
                                        Nombre <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name_supplier"
                                        name="name_supplier"
                                        placeholder="Nombre del proveedor"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_name_supplier">
                                        Nombre de contacto
                                    </Label>
                                    <Input
                                        id="contact_name_supplier"
                                        name="contact_name_supplier"
                                        placeholder="Nombre de la persona de contacto"
                                    />
                                    <InputError message={errors.contact_name_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email_supplier">Email</Label>
                                    <Input
                                        id="email_supplier"
                                        name="email_supplier"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                    />
                                    <InputError message={errors.email_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_supplier">Teléfono</Label>
                                    <Input
                                        id="phone_supplier"
                                        name="phone_supplier"
                                        type="tel"
                                        placeholder="+58 412 1234567"
                                    />
                                    <InputError message={errors.phone_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_supplier">Dirección</Label>
                                    <Textarea
                                        id="address_supplier"
                                        name="address_supplier"
                                        placeholder="Dirección del proveedor"
                                        rows={3}
                                    />
                                    <InputError message={errors.address_supplier} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creando...' : 'Crear proveedor'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={suppliers.index.url()}>
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

SuppliersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proveedores', href: suppliers.index.url() },
        { title: 'Nuevo', href: suppliers.create.url() },
    ],
};
