import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    /** Optional icon rendered in place of the title (e.g. HomeIcon for the first breadcrumb). */
    icon?: LucideIcon;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type NavItemGroup = {
    label: string;
    items: NavItem[];
    icon?: LucideIcon;
};
