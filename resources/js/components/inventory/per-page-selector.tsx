import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PER_PAGE_OPTIONS = [8, 10, 15, 20, 25, 50] as const;

function PerPageSelector({
    value,
    onChange,
    className,
}: {
    value: number;
    onChange: (value: number) => void;
    className?: string;
}) {
    function handleChange(newValue: string) {
        const perPage = parseInt(newValue, 10);
        if (!isNaN(perPage)) {
            onChange(perPage);
        }
    }

    return (
        <div className={cn('inline-flex items-center', className)} data-slot="per-page-selector">
            <Select value={String(value)} onValueChange={handleChange}>
                <SelectTrigger
                    size="sm"
                    className="h-8 min-w-[72px] px-2.5 text-xs font-medium bg-background/50 hover:bg-muted/40 transition-colors"
                    aria-label="Registros por página"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent side="top" align="start" className="min-w-[72px]">
                    {PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)} className="text-xs">
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export { PerPageSelector, PER_PAGE_OPTIONS };
