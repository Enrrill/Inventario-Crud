import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { ArrowLeftRight, BookOpen, ClipboardList, FileBarChart, FolderGit2, LayoutGrid, Package, Shield, Tags, Truck, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import audit from '@/routes/audit';
import categories from '@/routes/categories';
import movements from '@/routes/movements';
import products from '@/routes/products';
import reports from '@/routes/reports';
import suppliers from '@/routes/suppliers';
import users from '@/routes/users';
import type { NavItem, NavItemGroup } from '@/types';

const inventoryNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categorías',
        href: categories.index.url(),
        icon: Tags,
    },
    {
        title: 'Proveedores',
        href: suppliers.index.url(),
        icon: Truck,
    },
    {
        title: 'Productos',
        href: products.index.url(),
        icon: Package,
    },
    {
        title: 'Movimientos',
        href: movements.index.url(),
        icon: ArrowLeftRight,
    },
];

const reportNavItems: NavItem[] = [
    {
        title: 'Reportes',
        href: reports.index.url(),
        icon: FileBarChart,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Usuarios',
        href: users.index.url(),
        icon: Users,
    },
    {
        title: 'Auditoría',
        href: audit.index.url(),
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const groups: NavItemGroup[] = [
        { label: 'Inventario', items: inventoryNavItems },
        { label: 'Reportes', items: reportNavItems },
        ...(isAdmin ? [{ label: 'Administración', items: adminNavItems, icon: Shield }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
