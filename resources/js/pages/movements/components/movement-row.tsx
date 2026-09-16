import { ArrowDownCircleIcon, ArrowUpCircleIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StockBadge } from '@/components/inventory/stock-badge';
import { SearchableSelect } from '@/components/inventory/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import type { Product, StockMovementType, StockMovementTypeOption } from '@/types/inventory';

type MovementRowProps = {
    index: number;
    product: Product | undefined;
    typeMovement: string;
    quantity: string;
    products: Product[];
    types: StockMovementTypeOption[];
    errors: Record<string, string>;
    canRemove: boolean;
    onProductChange: (productId: string) => void;
    onTypeChange: (type: string) => void;
    onQuantityChange: (quantity: string) => void;
    onRemove: () => void;
};

const typeIcons: Record<StockMovementType, typeof ArrowDownCircleIcon> = {
    entry: ArrowDownCircleIcon,
    exit: ArrowUpCircleIcon,
    adjustment: RefreshCwIcon,
};

const typeColors: Record<StockMovementType, string> = {
    entry: 'text-emerald-600 dark:text-emerald-400',
    exit: 'text-red-600 dark:text-red-400',
    adjustment: 'text-blue-600 dark:text-blue-400',
};

function MovementRow({
    index,
    product,
    typeMovement,
    quantity,
    products,
    types,
    errors,
    canRemove,
    onProductChange,
    onTypeChange,
    onQuantityChange,
    onRemove,
}: MovementRowProps) {
    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: `${p.name_product} (${p.sku_product})`,
    }));

    const isExit = typeMovement === 'exit';
    const currentStock = product?.current_stock_product ?? 0;
    const quantityNum = parseInt(quantity, 10) || 0;
    const isStockInsufficient = isExit && quantityNum > currentStock;

    return (
        <div className="rounded-lg border bg-card p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="grid gap-3 sm:grid-cols-[1fr_160px_100px]">
                        <div className="space-y-1.5">
                            {index === 0 && (
                                <Label className="text-xs text-muted-foreground">
                                    Producto <span className="text-destructive">*</span>
                                </Label>
                            )}
                            <SearchableSelect
                                options={productOptions}
                                value={product ? String(product.id) : ''}
                                onValueChange={onProductChange}
                                placeholder="Seleccionar producto"
                                searchPlaceholder="Buscar por nombre o SKU..."
                            />
                            <InputError message={errors[`movements.${index}.product_id`]} />
                        </div>

                        <div className="space-y-1.5">
                            {index === 0 && (
                                <Label className="text-xs text-muted-foreground">
                                    Tipo <span className="text-destructive">*</span>
                                </Label>
                            )}
                            <Select value={typeMovement} onValueChange={onTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => {
                                        const Icon = typeIcons[t.value];
                                        return (
                                            <SelectItem key={t.value} value={t.value}>
                                                <span className="flex items-center gap-1.5">
                                                    <Icon className={`size-3.5 ${typeColors[t.value]}`} />
                                                    {t.label}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <InputError message={errors[`movements.${index}.type_movement`]} />
                        </div>

                        <div className="space-y-1.5">
                            {index === 0 && (
                                <Label className="text-xs text-muted-foreground">
                                    Cantidad <span className="text-destructive">*</span>
                                </Label>
                            )}
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => onQuantityChange(e.target.value)}
                                placeholder="0"
                            />
                            {isStockInsufficient && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    Stock insuficiente. Disponible: {currentStock}
                                </p>
                            )}
                            <InputError message={errors[`movements.${index}.quantity_movement`]} />
                        </div>
                    </div>

                    {product && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {product.name_product}
                            </span>
                            <span>&middot;</span>
                            <span>Stock actual: {product.current_stock_product}</span>
                            <span>&middot;</span>
                            <span>Mínimo: {product.minimum_stock_product}</span>
                            <StockBadge
                                currentStock={product.current_stock_product}
                                minimumStock={product.minimum_stock_product}
                                className="ml-auto"
                            />
                        </div>
                    )}
                </div>

                {canRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-5 size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={onRemove}
                    >
                        <XIcon className="size-4" />
                        <span className="sr-only">Eliminar movimiento</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

export { MovementRow };
