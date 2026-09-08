import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

function FilterBar({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-3',
                className,
            )}
        >
            {children}
        </div>
    );
}

export { FilterBar };
