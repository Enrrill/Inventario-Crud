import { Head, Link, router, usePage } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataTable } from '@/components/inventory/data-table';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchInput } from '@/components/inventory/search-input';
import { useQueryParams } from '@/hooks/use-query-params';
import users from '@/routes/users';
import type { User, UserRole } from '@/types/auth';
import type { PaginatedData } from '@/types/inventory';
import { cn } from '@/lib/utils';

type UsersIndexProps = {
    users: PaginatedData<User>;
    filters: { search?: string; role?: string };
};

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <Badge
            variant={role === 'admin' ? 'default' : 'secondary'}
            className="capitalize"
        >
            {role === 'admin' ? 'Administrador' : 'Empleado'}
        </Badge>
    );
}

export default function UsersIndex({ users: pagination }: UsersIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [filters, setFilters, clearFilters] = useQueryParams<{ search: string; role: string; per_page: string }>();
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const hasActiveFilters = Boolean(filters.search || filters.role);

    const handleSearch = useCallback(
        (value: string) => {
            setFilters({ search: value });
        },
        [setFilters],
    );

    function handleDelete() {
        if (!deleteUser) return;
        router.delete(users.destroy.url(deleteUser.id), {
            onSuccess: () => setDeleteUser(null),
        });
    }

    const columns: ColumnDef<StockFeatures, User>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <Link
                    href={users.show.url(row.original.id)}
                    className="hover:text-primary font-medium"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Correo',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.email}
                </span>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: ({ row }) => <RoleBadge role={row.original.role} />,
        },
        {
            accessorKey: 'created_at',
            header: 'Creado',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {new Date(row.original.created_at).toLocaleDateString('es-VE')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <span className="text-center">Acciones</span>,
            meta: { className: 'text-center' },
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.get(users.edit.url(row.original.id));
                        }}
                    >
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={row.original.id === currentUser.id}
                        title={row.original.id === currentUser.id ? 'No puedes eliminar tu propio usuario' : 'Eliminar'}
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteUser(row.original);
                        }}
                    >
                        <Trash2Icon className={cn('size-4', row.original.id === currentUser.id && 'opacity-30')} />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Usuarios"
                    description="Gestión de usuarios del sistema"
                >
                    <Button asChild>
                        <Link href={users.create.url()}>
                            <PlusIcon className="size-4" />
                            Nuevo usuario
                        </Link>
                    </Button>
                </PageHeader>

                <FilterBar>
                    <SearchInput
                        value={filters.search ?? ''}
                        onChange={handleSearch}
                        placeholder="Buscar usuario..."
                        className="w-full sm:w-80"
                    />
                    <Select
                        value={filters.role ?? 'all'}
                        onValueChange={(v) => setFilters({ role: v === 'all' ? '' : v })}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Todos los roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="employee">Empleado</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                            <XIcon className="size-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={pagination.data}
                    pagination={pagination}
                    showPerPage
                    onPerPageChange={(perPage) => setFilters({ per_page: String(perPage) })}
                    emptyTitle="Sin usuarios"
                    emptyDescription="No se encontraron usuarios. Crea uno nuevo para comenzar."
                    emptyAction={{
                        label: 'Nuevo usuario',
                        href: users.create.url(),
                    }}
                />

                <ConfirmDialog
                    open={deleteUser !== null}
                    onOpenChange={(open) => !open && setDeleteUser(null)}
                    title="Eliminar usuario"
                    description={`¿Estás seguro de eliminar al usuario "${deleteUser?.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: users.index.url() },
    ],
};
