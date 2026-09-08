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
    return (
        <>
            <Head title={`Editar ${product.name_product}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Editar Producto"
                    description={`Editando "${product.name_product}"`}
                >
                    <Button variant="outline" asChild>
                        <Link href={products.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                </PageHeader>

                <div className="max-w-2xl">
                    <Form
                        method="put"
                        action={products.update.url(product.id)}
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
                                        <input type="hidden" name="category_id" value="" />
                                        <Select
                                            name="category_id"
                                            defaultValue={String(product.category_id)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat.id}
                                                        value={String(cat.id)}
                                                    >
                                                        {cat.name_category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.category_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Proveedor</Label>
                                        <input type="hidden" name="supplier_id" value="" />
                                        <Select
                                            name="supplier_id"
                                            defaultValue={
                                                product.supplier_id
                                                    ? String(product.supplier_id)
                                                    : undefined
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar proveedor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Sin proveedor
                                                </SelectItem>
                                                {suppliers.map((sup) => (
                                                    <SelectItem
                                                        key={sup.id}
                                                        value={String(sup.id)}
                                                    >
                                                        {sup.name_supplier}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                    <Button variant="outline" asChild>
                                        <Link href={products.index.url()}>
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

ProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: products.index.url() },
        { title: 'Editar', href: '' },
    ],
};
