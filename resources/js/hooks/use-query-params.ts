import { router, usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export function useQueryParams<T extends Record<string, string>>(): [
    T,
    (params: Partial<T>) => void,
    () => void,
] {
    const page = usePage();

    const currentParams = useMemo(() => {
        const url = new URL(window.location.origin + page.url);
        const params: Record<string, string> = {};

        url.searchParams.forEach((value, key) => {
            if (value !== '' && value !== null) {
                params[key] = value;
            }
        });

        return params as T;
    }, [page.url]);

    const setParams = useCallback(
        (newParams: Partial<T>) => {
            const url = new URL(window.location.origin + page.url);
            const merged: Record<string, string> = {};

            url.searchParams.forEach((value, key) => {
                merged[key] = value;
            });

            Object.entries(newParams).forEach(([key, value]) => {
                if (value === '' || value === null || value === undefined) {
                    delete merged[key];
                } else {
                    merged[key] = String(value);
                }
            });

            merged['page'] = '1';

            router.get(url.pathname, merged, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [],
    );

    const clearParams = useCallback(() => {
        const url = new URL(window.location.origin + page.url);
        router.get(url.pathname, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    return [currentParams, setParams, clearParams];
}
