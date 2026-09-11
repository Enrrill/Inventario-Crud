import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchableSelectOption = {
    value: string;
    label: string;
};

function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Seleccionar...',
    className,
    searchPlaceholder = 'Buscar...',
}: {
    options: SearchableSelectOption[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    searchPlaceholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = useCallback(
        (newValue: string) => {
            onValueChange(newValue === value ? '' : newValue);
            setOpen(false);
            setSearch('');
        },
        [onValueChange, value],
    );

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        onValueChange('');
        setSearch('');
    }

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={cn(!selectedOption && 'text-muted-foreground')}>
                    {selectedOption?.label ?? placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {selectedOption && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 hover:bg-muted"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    )}
                    <ChevronDownIcon className={cn('text-muted-foreground size-4 transition-transform', open && 'rotate-180')} />
                </div>
            </button>

            {open && (
                <div className="bg-popover absolute z-50 mt-1 w-full min-w-[200px] overflow-hidden rounded-md border shadow-md">
                    <div className="border-b p-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="placeholder:text-muted-foreground flex h-8 w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-muted-foreground py-2 text-center text-sm">
                                Sin resultados
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground',
                                        value === option.value && 'bg-accent',
                                    )}
                                >
                                    <CheckIcon
                                        className={cn(
                                            'size-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { SearchableSelect };
export type { SearchableSelectOption };
