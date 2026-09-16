import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon } from 'lucide-react';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchableSelect } from '@/components/inventory/searchable-select';
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
    const back = useBackNavigation(categories.show.url(category.id));
    const parentOptions = [
        { value: 'none', label: 'Sin categoría padre' },
        ...parentCategories.map((cat) => ({
            value: String(cat.id),
            label: cat.name_category,
        })),
    ];

    return (
        <>
            <Head title={`Editar ${category.name_category}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Categoría"
                    description={`Editando "${category.name_category}"`}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="max-w-xl">
                    <Form
                        method="put"
                        action={categories.update.url(category.id)}
                        transform={(data) => ({
                            ...data,
                            parent_category_id: data.parent_category_id === 'none' ? null : data.parent_category_id,
                        })}
                        onError={() => toast.error('Error al guardar los cambios. Verifica los datos.')}
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
                                    <SearchableSelect
                                        name="parent_category_id"
                                        options={parentOptions}
                                        defaultValue={
                                            category.parent_category_id
                                                ? String(category.parent_category_id)
                                                : 'none'
                                        }
                                        placeholder="Sin categoría padre"
                                        searchPlaceholder="Buscar categoría padre..."
                                    />
                                    <InputError message={errors.parent_category_id} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={back}>
                                        Cancelar
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
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Categorías', href: categories.index.url() },
        { title: 'Editar', href: '' },
    ],
};
