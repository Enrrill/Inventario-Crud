import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
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

type CategoriesEditProps = {
    category: Category;
    parentCategories: Category[];
};

export default function CategoriesEdit({
    category,
    parentCategories,
}: CategoriesEditProps) {
    return (
        <>
            <Head title={`Editar ${category.name_category}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Categoría"
                    description={`Editando "${category.name_category}"`}
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
                        method="put"
                        action={categories.update.url(category.id)}
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
                                        defaultValue={category.name_category}
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
                                        defaultValue={category.description_category ?? ''}
                                        rows={3}
                                    />
                                    <InputError message={errors.description_category} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoría padre</Label>
                                    <input
                                        type="hidden"
                                        name="parent_category_id"
                                        value=""
                                    />
                                    <Select
                                        name="parent_category_id"
                                        defaultValue={
                                            category.parent_category_id
                                                ? String(category.parent_category_id)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sin categoría padre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Sin categoría padre
                                            </SelectItem>
                                            {parentCategories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.name_category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.parent_category_id} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
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

CategoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categorías', href: categories.index.url() },
        { title: 'Editar', href: '' },
    ],
};
