import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon } from 'lucide-react';
import { useBackNavigation } from '@/hooks/use-back-navigation';
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
import { SearchableSelect } from '@/components/inventory/searchable-select';
import products from '@/routes/products';
import type { Category, Product, Supplier } from '@/types/inventory';

const UNIDADES = [
    'Pieza',
    'Kilogramo',
    'Litro',
    'Metro',
    'Caja',
    'Par',
    'Juego',
];

type ProductsEditProps = {
    product: Product;
    categories: Category[];
    suppliers: Supplier[];
};

export default function ProductsEdit({
    product,
    categories,
    suppliers,
}: ProductsEditProps) {
    const back = useBackNavigation(products.show.url(product.id));
    const categoryOptions = categories.map((cat) => ({
        value: String(cat.id),
        label: cat.name_category,
    }));

    const supplierOptions = [
        { value: 'none', label: 'Sin proveedor' },
        ...suppliers.map((sup) => ({
            value: String(sup.id),
            label: sup.name_supplier,
        })),
    ];

    return (
        <>
            <Head title={`Editar ${product.name_product}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Producto"
                    description={`Editando "${product.name_product}"`}
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="max-w-2xl">
                    <Form
                        method="put"
                        action={products.update.url(product.id)}
                        transform={(data) => ({
                            ...data,
                            supplier_id: data.supplier_id === 'none' || !data.supplier_id ? null : data.supplier_id,
                        })}
                        onError={() => toast.error('Error al guardar los cambios. Verifica los datos.')}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku_product">
                                            SKU <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="sku_product"
                                            name="sku_product"
                                            defaultValue={product.sku_product}
                                            required
                                            autoFocus
                                        />
                                        <InputError message={errors.sku_product} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name_product">
                                            Nombre <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name_product"
                                            name="name_product"
                                            defaultValue={product.name_product}
                                            required
                                        />
                                        <InputError message={errors.name_product} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description_product">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        id="description_product"
                                        name="description_product"
                                        defaultValue={product.description_product ?? ''}
                                        rows={3}
                                    />
                                    <InputError message={errors.description_product} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>
                                            Categoría <span className="text-destructive">*</span>
                                        </Label>
                                        <SearchableSelect
                                            name="category_id"
                                            options={categoryOptions}
                                            defaultValue={String(product.category_id)}
                                            placeholder="Seleccionar categoría"
                                            searchPlaceholder="Buscar categoría..."
                                        />
                                        <InputError message={errors.category_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Proveedor</Label>
                                        <SearchableSelect
                                            name="supplier_id"
                                            options={supplierOptions}
                                            defaultValue={
                                                product.supplier_id
                                                    ? String(product.supplier_id)
                                                    : 'none'
                                            }
                                            placeholder="Seleccionar proveedor"
                                            searchPlaceholder="Buscar proveedor..."
                                        />
                                        <InputError message={errors.supplier_id} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="unit_price_product">
                                            Precio unitario{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="unit_price_product"
                                            name="unit_price_product"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={product.unit_price_product}
                                            required
                                        />
                                        <InputError message={errors.unit_price_product} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Unidad de medida{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <input
                                            type="hidden"
                                            name="unit_of_measure_product"
                                            value=""
                                        />
                                        <Select
                                            name="unit_of_measure_product"
                                            defaultValue={product.unit_of_measure_product}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar unidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {UNIDADES.map((unidad) => (
                                                    <SelectItem key={unidad} value={unidad}>
                                                        {unidad}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.unit_of_measure_product}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minimum_stock_product">
                                            Stock mínimo{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="minimum_stock_product"
                                            name="minimum_stock_product"
                                            type="number"
                                            min="0"
                                            defaultValue={product.minimum_stock_product}
                                            required
                                        />
                                        <InputError
                                            message={errors.minimum_stock_product}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="hidden"
                                            name="is_active_product"
                                            value="0"
                                        />
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="is_active_product"
                                                value="1"
                                                defaultChecked={product.is_active_product}
                                                className="border-input rounded"
                                            />
                                            <span className="text-sm">
                                                Producto activo
                                            </span>
                                        </label>
                                    </div>
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

ProductsEdit.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Productos', href: products.index.url() },
        { title: 'Editar', href: '' },
    ],
};
