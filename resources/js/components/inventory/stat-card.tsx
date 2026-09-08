import type { LucideIcon } from 'lucide-react';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-2">
                    {description && (
                        <p className="text-muted-foreground text-xs">{description}</p>
                    )}
                    {trend && (
                        <span
                            className={cn(
                                'inline-flex items-center text-xs font-medium',
                                trend.isPositive ? 'text-emerald-600' : 'text-red-600',
                            )}
                        >
                            {trend.isPositive ? (
                                <TrendingUpIcon className="mr-0.5 size-3" />
                            ) : (
                                <TrendingDownIcon className="mr-0.5 size-3" />
                            )}
                            {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export { StatCard };
