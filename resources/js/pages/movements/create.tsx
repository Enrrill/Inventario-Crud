import { Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon, HomeIcon, PlusIcon } from 'lucide-react';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/inventory/page-header';
import { MovementRow } from './components/movement-row';
import movements from '@/routes/movements';
import type { Product, StockMovementType, StockMovementTypeOption } from '@/types/inventory';
import type { MovementFormData } from '@/types/inventory';

const MAX_MOVEMENTS = 20;

type MovementsCreateProps = {
    products: Product[];
    types: StockMovementTypeOption[];
};

function createEmptyRow(): MovementFormData {
    return {
        product_id: '',
        type_movement: '',
        quantity_movement: '',
    };
}

export default function MovementsCreate({ products, types }: MovementsCreateProps) {
    const back = useBackNavigation(movements.index.url());

    const [rows, setRows] = useState<MovementFormData[]>([createEmptyRow()]);

    const updateRow = useCallback((index: number, field: keyof MovementFormData, value: string) => {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    }, []);

    const addRow = useCallback(() => {
        setRows((prev) => (prev.length < MAX_MOVEMENTS ? [...prev, createEmptyRow()] : prev));
    }, []);

    const removeRow = useCallback((index: number) => {
        setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    }, []);

    const summary = useMemo(() => {
        const entries = rows.filter((r) => r.type_movement === 'entry').length;
        const exits = rows.filter((r) => r.type_movement === 'exit').length;
        const adjustments = rows.filter((r) => r.type_movement === 'adjustment').length;
        return { entries, exits, adjustments, total: rows.length };
    }, [rows]);

    const hasInsufficientStock = useMemo(() => {
        return rows.some((row) => {
            if (row.type_movement !== 'exit' || !row.product_id) return false;
            const product = products.find((p) => p.id === Number(row.product_id));
            const qty = parseInt(row.quantity_movement, 10) || 0;
            return product && qty > product.current_stock_product;
        });
    }, [rows, products]);

    const hasEmptyRequired = useMemo(() => {
        return rows.some((row) => !row.product_id || !row.type_movement || !row.quantity_movement);
    }, [rows]);

    const isSubmitDisabled = hasInsufficientStock || hasEmptyRequired;

    return (
        <>
            <Head title="Registrar Movimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Registrar Movimientos"
                    description="Agregar múltiples entradas, salidas o ajustes de stock en un solo lote"
                >
                    <Button variant="outline" onClick={back}>
                        <ArrowLeftIcon className="size-4" />
                        Volver
                    </Button>
                </PageHeader>

                <div className="max-w-3xl">
                    <Form
                        method="post"
                        action={movements.store.url()}
                        onError={() => toast.error('Error al registrar los movimientos. Verifica los datos.')}
                        className="space-y-5"
                        transform={(data) => {
                            const movements = rows
                                .filter((r) => r.product_id && r.type_movement && r.quantity_movement)
                                .map((r) => ({
                                    product_id: Number(r.product_id),
                                    type_movement: r.type_movement as StockMovementType,
                                    quantity_movement: parseInt(r.quantity_movement, 10),
                                }));

                            return {
                                movements,
                                reference_movement: data.reference_movement ?? '',
                                notes_movement: data.notes_movement ?? '',
                            };
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-3">
                                    {rows.map((row, index) => (
                                        <MovementRow
                                            key={index}
                                            index={index}
                                            product={products.find((p) => p.id === Number(row.product_id))}
                                            typeMovement={row.type_movement}
                                            quantity={row.quantity_movement}
                                            products={products}
                                            types={types}
                                            errors={errors}
                                            canRemove={rows.length > 1}
                                            onProductChange={(v) => updateRow(index, 'product_id', v)}
                                            onTypeChange={(v) => updateRow(index, 'type_movement', v)}
                                            onQuantityChange={(v) => updateRow(index, 'quantity_movement', v)}
                                            onRemove={() => removeRow(index)}
                                        />
                                    ))}
                                </div>

                                {rows.length < MAX_MOVEMENTS && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addRow}
                                        className="w-full border-dashed"
                                    >
                                        <PlusIcon className="size-4" />
                                        Agregar producto
                                    </Button>
                                )}

                                {summary.total > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {summary.total} {summary.total === 1 ? 'movimiento' : 'movimientos'}:
                                        </span>
                                        {summary.entries > 0 && (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                                                {summary.entries} entrada{summary.entries > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {summary.exits > 0 && (
                                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-400">
                                                {summary.exits} salida{summary.exits > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {summary.adjustments > 0 && (
                                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                                                {summary.adjustments} ajuste{summary.adjustments > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_movement">
                                            Referencia (compartida)
                                        </Label>
                                        <Input
                                            id="reference_movement"
                                            name="reference_movement"
                                            placeholder="Ej: OC-2026-001"
                                            maxLength={100}
                                        />
                                        <InputError message={errors.reference_movement} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes_movement">
                                            Notas (compartidas)
                                        </Label>
                                        <Textarea
                                            id="notes_movement"
                                            name="notes_movement"
                                            placeholder="Detalles del lote de movimientos..."
                                            rows={3}
                                        />
                                        <InputError message={errors.notes_movement} />
                                    </div>
                                </div>

                                {errors.movements && typeof errors.movements === 'string' && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {errors.movements}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || isSubmitDisabled}
                                    >
                                        {processing
                                            ? 'Registrando...'
                                            : `Registrar ${summary.total === 1 ? 'movimiento' : `${summary.total} movimientos`}`}
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

MovementsCreate.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Movimientos', href: movements.index.url() },
        { title: 'Nuevo', href: '' },
    ],
};
