import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
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
import { StockBadge } from '@/components/inventory/stock-badge';
import { PageHeader } from '@/components/inventory/page-header';
import movements from '@/routes/movements';
import type { Product, StockMovementType } from '@/types/inventory';

type MovementsCreateProps = {
    products: Product[];
    types: { value: StockMovementType; label: string }[];
};

export default function MovementsCreate({
    products,
    types,
}: MovementsCreateProps) {
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');

    const selectedProduct = products.find(
        (p) => p.id === Number(selectedProductId),
    );

    const isExit = selectedType === 'exit';
    const currentStock = selectedProduct?.current_stock_product ?? 0;
    const quantityNum = parseInt(quantity, 10) || 0;
    const isStockInsufficient = isExit && quantityNum > currentStock;

    return (
        <>
            <Head title="Nuevo Movimiento" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Nuevo Movimiento"
                    description="Registrar entrada, salida o ajuste de stock"
                >
                    <Button variant="outline" asChild>
                        <Link href={movements.index.url()}>
                            <ArrowLeftIcon className="size-4" />
                            Volver
                        </Link>
                    </Button>
                </PageHeader>

                <div className="max-w-2xl">
                    <Form
                        method="post"
                        action={movements.store.url()}
                        onError={() => toast.error('Error al registrar el movimiento. Verifica los datos.')}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>
                                            Producto <span className="text-destructive">*</span>
                                        </Label>
                                        <input type="hidden" name="product_id" value="" />
                                        <Select
                                            name="product_id"
                                            value={selectedProductId}
                                            onValueChange={(v) => setSelectedProductId(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar producto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name_product}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.product_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Tipo de movimiento{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <input type="hidden" name="type_movement" value="" />
                                        <Select
                                            name="type_movement"
                                            value={selectedType}
                                            onValueChange={(v) => setSelectedType(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.type_movement} />
                                    </div>
                                </div>

                                {selectedProduct && (
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {selectedProduct.name_product}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    SKU: {selectedProduct.sku_product}
                                                </p>
                                            </div>
                                            <StockBadge
                                                currentStock={selectedProduct.current_stock_product}
                                                minimumStock={selectedProduct.minimum_stock_product}
                                            />
                                        </div>
                                        <div className="text-muted-foreground mt-2 text-sm">
                                            Stock actual:{' '}
                                            <span className="font-medium">
                                                {selectedProduct.current_stock_product}
                                            </span>
                                            {' '}&middot; Mínimo:{' '}
                                            <span className="font-medium">
                                                {selectedProduct.minimum_stock_product}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity_movement">
                                            Cantidad{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="quantity_movement"
                                            name="quantity_movement"
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        {isStockInsufficient && (
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                Stock insuficiente. Disponible: {currentStock}
                                            </p>
                                        )}
                                        <InputError message={errors.quantity_movement} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference_movement">
                                            Referencia
                                        </Label>
                                        <Input
                                            id="reference_movement"
                                            name="reference_movement"
                                            placeholder="Ej: OC-2026-001"
                                            maxLength={100}
                                        />
                                        <InputError message={errors.reference_movement} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes_movement">Notas</Label>
                                    <Textarea
                                        id="notes_movement"
                                        name="notes_movement"
                                        placeholder="Detalles del movimiento..."
                                        rows={3}
                                    />
                                    <InputError message={errors.notes_movement} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || isStockInsufficient}
                                    >
                                        {processing
                                            ? 'Registrando...'
                                            : 'Registrar movimiento'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={movements.index.url()}>
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

MovementsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Movimientos', href: movements.index.url() },
        { title: 'Nuevo', href: '' },
    ],
};
