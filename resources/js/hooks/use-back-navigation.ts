import { router } from '@inertiajs/react';

/**
 * Hook for intelligent back navigation.
 *
 * Uses the SPA history stack when the user navigated within the app,
 * and falls back to a fixed URL when the page was accessed directly (e.g. by typing the URL).
 *
 * @param fallback - The URL to navigate to when there is no SPA history.
 */
export function useBackNavigation(fallback: string): () => void {
    return function back() {
        // window.history.length > 2: browser always starts at 1 (blank), so > 2 means
        // the user actually navigated from somewhere within the session.
        // document.referrer check ensures the previous page belongs to the same origin.
        const hasSpaHistory =
            window.history.length > 2 &&
            (document.referrer === '' || document.referrer.startsWith(window.location.origin));

        if (hasSpaHistory) {
            window.history.back();
        } else {
            router.visit(fallback);
        }
    };
}
