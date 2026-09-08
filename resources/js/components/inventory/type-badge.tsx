import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    RefreshCwIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StockMovementType } from '@/types/inventory';

const typeConfig: Record<
    StockMovementType,
    {
        label: string;
        icon: typeof ArrowDownCircleIcon;
        className: string;
    }
> = {
    entry: {
        label: 'Entrada',
        icon: ArrowDownCircleIcon,
        className:
            'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    exit: {
        label: 'Salida',
        icon: ArrowUpCircleIcon,
        className:
            'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    },
    adjustment: {
        label: 'Ajuste',
        icon: RefreshCwIcon,
        className:
            'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    },
};

function TypeBadge({
    type,
    className,
    ...props
}: {
    type: StockMovementType;
} & React.ComponentProps<typeof Badge>) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <Badge
            variant="outline"
            className={cn(config.className, className)}
            {...props}
        >
            <Icon className="size-3" />
            {config.label}
        </Badge>
    );
}

export { TypeBadge, typeConfig };
