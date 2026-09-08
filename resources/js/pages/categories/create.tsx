import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import categories from '@/routes/categories';
import type { Category } from '@/types/inventory';

type CategoriesCreateProps = {
    parentCategories: Category[];
};

export default function CategoriesCreate({
    parentCategories,
}: CategoriesCreateProps) {
    return (
        <>
            <Head title="Nueva Categoría" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Nueva Categoría"
                    description="Crea una nueva categoría para el inventario"
                >
                    <Button variant="outline" asChild>
                        <Link href={categories.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                </PageHeader>

                <div className="max-w-xl">
                    <Form
                        method="post"
                        action={categories.store.url()}
                        transform={(data) => ({
                            ...data,
                            parent_category_id: data.parent_category_id === 'none' ? null : data.parent_category_id,
                        })}
                        onError={() => toast.error('Error al crear la categoría. Verifica los datos.')}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name_category">
                                        Nombre <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name_category"
                                        name="name_category"
                                        placeholder="Nombre de la categoría"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name_category} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description_category">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        id="description_category"
                                        name="description_category"
                                        placeholder="Descripción de la categoría (opcional)"
                                        rows={3}
                                    />
                                    <InputError message={errors.description_category} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoría padre</Label>
                                    <Select name="parent_category_id">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sin categoría padre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Sin categoría padre
                                            </SelectItem>
                                            {parentCategories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name_category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.parent_category_id} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creando...' : 'Crear categoría'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={categories.index.url()}>
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

CategoriesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categorías', href: categories.index.url() },
        { title: 'Nueva', href: categories.create.url() },
    ],
};
