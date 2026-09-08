import type { ReactNode } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

function FormDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    side = 'right',
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    side?: 'left' | 'right';
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className="flex flex-col gap-0 p-0">
                <SheetHeader className="border-b px-6 py-4">
                    <SheetTitle>{title}</SheetTitle>
                    {description && (
                        <SheetDescription>{description}</SheetDescription>
                    )}
                </SheetHeader>
                <div className="flex-1 overflow-auto px-6 py-4">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export { FormDrawer };
