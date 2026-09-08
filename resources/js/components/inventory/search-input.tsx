import { useEffect, useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function SearchInput({
    value,
    onChange,
    placeholder = 'Buscar...',
    className,
    debounceMs = 300,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    }

    return (
        <div className={cn('relative', className)}>
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
                type="text"
                defaultValue={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border py-1 pr-4 pl-9 text-sm shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
    );
}

export { SearchInput };
