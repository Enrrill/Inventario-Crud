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
import type { Category, Supplier } from '@/types/inventory';

const UNIDADES = [
    'Pieza',
    'Kilogramo',
    'Litro',
    'Metro',
    'Caja',
    'Par',
    'Juego',
];

type ProductsCreateProps = {
    categories: Category[];
    suppliers: Supplier[];
};

export default function ProductsCreate({
    categories,
    suppliers,
}: ProductsCreateProps) {
    const back = useBackNavigation(products.index.url());
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
            <Head title="Nuevo Producto" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Nuevo Producto"
                    description="Registra un nuevo producto en el inventario"
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="max-w-2xl">
                    <Form
                        method="post"
                        action={products.store.url()}
                        transform={(data) => ({
                            ...data,
                            supplier_id: data.supplier_id === 'none' ? null : data.supplier_id,
                        })}
                        onError={() => toast.error('Error al crear el producto. Verifica los datos.')}
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
                                            placeholder="A001"
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
                                            placeholder="Nombre del producto"
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
                                        placeholder="Descripción del producto (opcional)"
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
                                            placeholder="Seleccionar proveedor"
                                            searchPlaceholder="Buscar proveedor..."
                                            defaultValue="none"
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
                                            placeholder="0.00"
                                            required
                                        />
                                        <InputError message={errors.unit_price_product} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Unidad de medida{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Select name="unit_of_measure_product">
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
                                            placeholder="0"
                                            required
                                        />
                                        <InputError
                                            message={errors.minimum_stock_product}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="current_stock_product">
                                        Stock inicial
                                    </Label>
                                    <Input
                                        id="current_stock_product"
                                        name="current_stock_product"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        defaultValue="0"
                                    />
                                    <InputError
                                        message={errors.current_stock_product}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creando...' : 'Crear producto'}
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

ProductsCreate.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Productos', href: products.index.url() },
        { title: 'Nuevo', href: products.create.url() },
    ],
};
