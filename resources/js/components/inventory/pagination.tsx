import { router } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PerPageSelector } from '@/components/inventory/per-page-selector';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/inventory';

function Pagination({
    data,
    preserveScroll = true,
    showPerPage = false,
    onPerPageChange,
}: {
    data: PaginatedData<unknown>;
    preserveScroll?: boolean;
    showPerPage?: boolean;
    onPerPageChange?: (value: number) => void;
}) {
    const { current_page, last_page, total, per_page } = data;
    const from = (current_page - 1) * per_page + 1;
    const to = Math.min(current_page * per_page, total);

    function goToPage(page: number) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        router.get(url.pathname + url.search, {}, {
            preserveScroll,
            preserveState: true,
        });
    }

    function getVisiblePages(): (number | '...')[] {
        const pages: (number | '...')[] = [];
        const maxVisible = 5;

        if (last_page <= maxVisible) {
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
            return pages;
        }

        pages.push(1);

        if (current_page > 3) {
            pages.push('...');
        }

        const start = Math.max(2, current_page - 1);
        const end = Math.min(last_page - 1, current_page + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (current_page < last_page - 2) {
            pages.push('...');
        }

        pages.push(last_page);

        return pages;
    }

    if (last_page <= 1 && !showPerPage) return null;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-muted-foreground text-sm">
                    Mostrando <span className="font-medium">{from}</span> a{' '}
                    <span className="font-medium">{to}</span> de{' '}
                    <span className="font-medium">{total}</span> registros
                </p>
                {showPerPage && (
                    <PerPageSelector
                        value={per_page}
                        onChange={onPerPageChange ?? (() => {})}
                    />
                )}
            </div>
            {last_page > 1 && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => goToPage(1)}
                        disabled={current_page === 1}
                    >
                        <ChevronsLeftIcon className="size-4" />
                        <span className="sr-only">Primera página</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => goToPage(current_page - 1)}
                        disabled={current_page === 1}
                    >
                        <ChevronLeftIcon className="size-4" />
                        <span className="sr-only">Página anterior</span>
                    </Button>
                    {getVisiblePages().map((page, index) =>
                        page === '...' ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="text-muted-foreground px-2 text-sm"
                            >
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                variant={current_page === page ? 'default' : 'outline'}
                                size="icon-sm"
                                onClick={() => goToPage(page)}
                                className={cn(
                                    current_page === page &&
                                        'pointer-events-none',
                                )}
                            >
                                {page}
                            </Button>
                        ),
                    )}
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => goToPage(current_page + 1)}
                        disabled={current_page === last_page}
                    >
                        <ChevronRightIcon className="size-4" />
                        <span className="sr-only">Página siguiente</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => goToPage(last_page)}
                        disabled={current_page === last_page}
                    >
                        <ChevronsRightIcon className="size-4" />
                        <span className="sr-only">Última página</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

export { Pagination };
