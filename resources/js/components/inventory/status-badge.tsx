import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function StatusBadge({
    active,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    className,
    ...props
}: {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
} & React.ComponentProps<typeof Badge>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'border-transparent',
                active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400',
                className,
            )}
            {...props}
        >
            {active ? activeLabel : inactiveLabel}
        </Badge>
    );
}

export { StatusBadge };
