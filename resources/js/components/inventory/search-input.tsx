import { useEffect, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
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
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs]);

    function handleClear() {
        setLocalValue('');
        onChange('');
    }

    return (
        <div className={cn('relative', className)}>
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border py-1 pr-8 pl-9 text-sm shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 hover:bg-muted"
                >
                    <XIcon className="size-3.5" />
                    <span className="sr-only">Limpiar búsqueda</span>
                </button>
            )}
        </div>
    );
}

export { SearchInput };
