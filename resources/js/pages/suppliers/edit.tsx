import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import suppliers from '@/routes/suppliers';
import type { Supplier } from '@/types/inventory';

type SuppliersEditProps = {
    supplier: Supplier;
};

export default function SuppliersEdit({ supplier }: SuppliersEditProps) {
    return (
        <>
            <Head title={`Editar ${supplier.name_supplier}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Proveedor"
                    description={`Editando "${supplier.name_supplier}"`}
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
                        method="put"
                        action={suppliers.update.url(supplier.id)}
                        onError={() => toast.error('Error al guardar los cambios. Verifica los datos.')}
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
                                        defaultValue={supplier.name_supplier}
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
                                        defaultValue={supplier.contact_name_supplier ?? ''}
                                    />
                                    <InputError message={errors.contact_name_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email_supplier">Email</Label>
                                    <Input
                                        id="email_supplier"
                                        name="email_supplier"
                                        type="email"
                                        defaultValue={supplier.email_supplier ?? ''}
                                    />
                                    <InputError message={errors.email_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_supplier">Teléfono</Label>
                                    <Input
                                        id="phone_supplier"
                                        name="phone_supplier"
                                        type="tel"
                                        defaultValue={supplier.phone_supplier ?? ''}
                                    />
                                    <InputError message={errors.phone_supplier} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_supplier">Dirección</Label>
                                    <Textarea
                                        id="address_supplier"
                                        name="address_supplier"
                                        defaultValue={supplier.address_supplier ?? ''}
                                        rows={3}
                                    />
                                    <InputError message={errors.address_supplier} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
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

SuppliersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proveedores', href: suppliers.index.url() },
        { title: 'Editar', href: '' },
    ],
};
