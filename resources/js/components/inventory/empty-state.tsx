import { Link } from '@inertiajs/react';
import { Package, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function EmptyState({
    icon: Icon = Package,
    title,
    description,
    action,
}: {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <Icon className="text-muted-foreground size-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {description}
            </p>
            {action && (
                <Button asChild className="mt-6">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    );
}

export { EmptyState };
