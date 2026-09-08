import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const nextValue =
                    value instanceof Function ? value(prev) : value;

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(nextValue));
                }

                return nextValue;
            });
        },
        [key],
    );

    useEffect(() => {
        function handleStorageChange(event: StorageEvent) {
            if (event.key !== key) return;

            try {
                const newValue = event.newValue
                    ? (JSON.parse(event.newValue) as T)
                    : initialValue;
                setStoredValue(newValue);
            } catch {
                setStoredValue(initialValue);
            }
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setValue];
}
