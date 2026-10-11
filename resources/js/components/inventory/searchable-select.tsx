import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchableSelectOption = {
    value: string;
    label: string;
};

type SearchableSelectProps = {
    options: SearchableSelectOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    searchPlaceholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    id?: string;
};

function SearchableSelect({
    options,
    value: controlledValue,
    defaultValue,
    onValueChange,
    placeholder = 'Seleccionar...',
    className,
    searchPlaceholder = 'Buscar...',
    name,
    disabled = false,
    required = false,
    id,
}: SearchableSelectProps) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
        defaultValue ?? '',
    );
    const currentValue = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === currentValue);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = useCallback(
        (newValue: string) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onValueChange?.(newValue);
            setOpen(false);
            setSearch('');
        },
        [isControlled, onValueChange],
    );

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch('');
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <div
            ref={containerRef}
            className={cn('relative', className)}
            data-slot="searchable-select"
        >
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={currentValue}
                    required={required}
                />
            )}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span
                    className={cn(
                        'mr-2 flex-1 truncate text-left',
                        !selectedOption && 'text-muted-foreground',
                    )}
                    title={selectedOption?.label}
                >
                    {selectedOption?.label ?? placeholder}
                </span>
                <ChevronDownIcon
                    className={cn(
                        'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open && (
                <div className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute left-0 z-50 mt-1 w-full max-w-sm min-w-[240px] overflow-hidden rounded-md border shadow-lg duration-100 sm:min-w-[280px]">
                    <div className="bg-muted/30 border-b p-1.5">
                        <div className="relative flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="placeholder:text-muted-foreground flex h-8 w-full rounded-sm bg-transparent px-2.5 py-1 pr-7 text-sm outline-none"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted absolute right-1.5 rounded-xs p-0.5"
                                >
                                    <XIcon className="size-3.5" />
                                    <span className="sr-only">
                                        Limpiar búsqueda
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-muted-foreground py-3 text-center text-sm">
                                Sin resultados
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    title={option.label}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        'hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-3 pl-2 text-left text-sm outline-hidden transition-colors select-none',
                                        currentValue === option.value &&
                                            'bg-accent/80 text-accent-foreground font-medium',
                                    )}
                                >
                                    <CheckIcon
                                        className={cn(
                                            'text-primary size-4 shrink-0',
                                            currentValue === option.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <span className="flex-1 truncate text-left">
                                        {option.label}
                                    </span>
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
export type { SearchableSelectOption, SearchableSelectProps };
