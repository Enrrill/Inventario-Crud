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
    onPageChange,
    onPerPageChange,
    className,
}: {
    data: PaginatedData<unknown>;
    preserveScroll?: boolean;
    showPerPage?: boolean;
    onPageChange?: (page: number) => void;
    onPerPageChange?: (value: number) => void;
    className?: string;
}) {
    const { current_page, last_page, total, per_page } = data;
    const isSinglePageOrEmpty = last_page <= 1;
    const from = total === 0 ? 0 : (current_page - 1) * per_page + 1;
    const to = total === 0 ? 0 : Math.min(current_page * per_page, total);

    function goToPage(page: number) {
        if (isSinglePageOrEmpty || page === current_page) return;
        if (onPageChange) {
            onPageChange(page);
            return;
        }
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        router.get(url.pathname + url.search, {}, {
            preserveScroll,
            preserveState: true,
        });
    }

    function getVisiblePages(): (number | '...')[] {
        if (last_page <= 1) {
            return [1];
        }

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

    const isFirstDisabled = current_page <= 1 || isSinglePageOrEmpty || total === 0;
    const isLastDisabled = current_page >= last_page || isSinglePageOrEmpty || total === 0;

    return (
        <div
            data-slot="pagination"
            className={cn(
                'flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center px-1 py-2',
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                <span>
                    {total === 0 ? (
                        <span>Mostrando <span className="font-semibold text-foreground">0</span> registros</span>
                    ) : (
                        <>
                            Mostrando{' '}
                            <span className="font-semibold text-foreground">
                                {from === to ? from : `${from}–${to}`}
                            </span>{' '}
                            de{' '}
                            <span className="font-semibold text-foreground">{total}</span>{' '}
                            {total === 1 ? 'registro' : 'registros'}
                        </>
                    )}
                </span>
                {showPerPage && (
                    <div className="flex items-center gap-1.5 border-l border-border/80 pl-2 sm:pl-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Por página:</span>
                        <PerPageSelector
                            value={per_page}
                            onChange={onPerPageChange ?? (() => {})}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => goToPage(1)}
                    disabled={isFirstDisabled}
                    className="size-8"
                    aria-label="Primera página"
                >
                    <ChevronsLeftIcon className="size-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => goToPage(current_page - 1)}
                    disabled={isFirstDisabled}
                    className="size-8"
                    aria-label="Página anterior"
                >
                    <ChevronLeftIcon className="size-4" />
                </Button>

                {getVisiblePages().map((page, index) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="text-muted-foreground px-1.5 text-xs select-none"
                        >
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={current_page === page && total > 0 ? 'default' : 'outline'}
                            size="icon-sm"
                            onClick={() => goToPage(page)}
                            disabled={total === 0 || (isSinglePageOrEmpty && page === 1)}
                            className={cn(
                                'size-8 text-xs font-medium',
                                current_page === page && total > 0 && 'pointer-events-none shadow-xs',
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
                    disabled={isLastDisabled}
                    className="size-8"
                    aria-label="Página siguiente"
                >
                    <ChevronRightIcon className="size-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => goToPage(last_page)}
                    disabled={isLastDisabled}
                    className="size-8"
                    aria-label="Última página"
                >
                    <ChevronsRightIcon className="size-4" />
                </Button>
            </div>
        </div>
    );
}

export { Pagination };
