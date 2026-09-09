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
        description: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Claro',
            description: 'Tema claro para ambientes con buena iluminación',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Oscuro',
            description: 'Tema oscuro para reducir la fatiga visual',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Sistema',
            description: 'Se adapta automáticamente a la configuración de tu dispositivo',
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {options.map(({ value, icon: Icon, label, description }) => (
                            <button
                                key={value}
                                onClick={() => updateAppearance(value)}
                                className={cn(
                                    'rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50',
                                    appearance === value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border',
                                )}
                            >
                                <div
                                    className={cn(
                                        'mb-3 flex size-10 items-center justify-center rounded-lg',
                                        appearance === value
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <p className="font-medium">{label}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {description}
                                </p>
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
