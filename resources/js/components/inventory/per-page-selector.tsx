import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const PER_PAGE_OPTIONS = [8, 10, 15, 20, 25, 50] as const;

function PerPageSelector({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    function handleChange(newValue: string) {
        const perPage = parseInt(newValue, 10);
        onChange(perPage);
        const url = new URL(window.location.href);
        url.searchParams.set('per_page', String(perPage));
        url.searchParams.delete('page');
        router.get(url.pathname + url.search, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Mostrar</span>
            <Select value={String(value)} onValueChange={handleChange}>
                <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">por página</span>
        </div>
    );
}

export { PerPageSelector };
