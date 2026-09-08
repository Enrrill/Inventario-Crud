import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stockBadgeVariants = cva(
    'border-transparent',
    {
        variants: {
            variant: {
                'in-stock':
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
                'low-stock':
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
                'out-of-stock':
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
            },
        },
        defaultVariants: {
            variant: 'in-stock',
        },
    },
);

function getStockVariant(
    currentStock: number,
    minimumStock: number,
): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (currentStock === 0) return 'out-of-stock';
    if (currentStock <= minimumStock) return 'low-stock';
    return 'in-stock';
}

function getStockLabel(
    variant: 'in-stock' | 'low-stock' | 'out-of-stock',
): string {
    switch (variant) {
        case 'in-stock':
            return 'Con stock';
        case 'low-stock':
            return 'Stock bajo';
        case 'out-of-stock':
            return 'Sin stock';
    }
}

function StockBadge({
    currentStock,
    minimumStock,
    showValue = true,
    className,
    ...props
}: {
    currentStock: number;
    minimumStock: number;
    showValue?: boolean;
} & React.ComponentProps<typeof Badge>) {
    const variant = getStockVariant(currentStock, minimumStock);

    return (
        <Badge
            variant="outline"
            className={cn(stockBadgeVariants({ variant }), className)}
            {...props}
        >
            {getStockLabel(variant)}
            {showValue && (
                <span className="ml-1 opacity-70">({currentStock})</span>
            )}
        </Badge>
    );
}

export { StockBadge, stockBadgeVariants, getStockVariant };
