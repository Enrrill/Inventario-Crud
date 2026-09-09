import { Head } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import Heading from '@/components/heading';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import type { Appearance } from '@/hooks/use-appearance';

export default function Appearance() {
    const { appearance, updateAppearance } = useAppearance();

    const options: {
        value: Appearance;
        icon: typeof Sun;
        label: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Claro',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Oscuro',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Sistema',
        },
    ];

    return (
        <>
            <Head title="Apariencia" />

            <h1 className="sr-only">Apariencia</h1>

            <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-medium">Apariencia</h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Selecciona el tema de la interfaz que prefieras
                    </p>

                    <div className="flex gap-3">
                        {options.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => updateAppearance(value)}
                                title={label}
                                className={cn(
                                    'flex size-12 items-center justify-center rounded-xl border-2 transition-all hover:border-primary/50',
                                    appearance === value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="size-5" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Apariencia',
            href: editAppearance(),
        },
    ],
};
