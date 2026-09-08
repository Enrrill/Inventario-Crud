import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

function DataGrid({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className,
            )}
        >
            {children}
        </div>
    );
}

export { DataGrid };
