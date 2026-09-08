import { LayoutGridIcon, ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ViewToggle({
    view,
    onViewChange,
}: {
    view: 'list' | 'grid';
    onViewChange: (view: 'list' | 'grid') => void;
}) {
    return (
        <div className="flex items-center border rounded-md">
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewChange('list')}
                className={cn(
                    'rounded-none rounded-l-md',
                    view === 'list' && 'bg-accent text-accent-foreground',
                )}
            >
                <ListIcon className="size-4" />
                <span className="sr-only">Vista lista</span>
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewChange('grid')}
                className={cn(
                    'rounded-none rounded-r-md',
                    view === 'grid' && 'bg-accent text-accent-foreground',
                )}
            >
                <LayoutGridIcon className="size-4" />
                <span className="sr-only">Vista cuadrícula</span>
            </Button>
        </div>
    );
}

export { ViewToggle };
