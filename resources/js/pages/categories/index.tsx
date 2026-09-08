import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataTable } from '@/components/inventory/data-table';
import { EmptyState } from '@/components/inventory/empty-state';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchInput } from '@/components/inventory/search-input';
import { useQueryParams } from '@/hooks/use-query-params';
import categories from '@/routes/categories';
import type { Category, PaginatedData } from '@/types/inventory';
import { useState } from 'react';

type CategoriesIndexProps = {
    categories: PaginatedData<Category>;
};

export default function CategoriesIndex({ categories: pagination }: CategoriesIndexProps) {
    const [filters, setFilters] = useQueryParams<{ search: string }>();
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

    function handleSearch(value: string) {
        setFilters({ search: value });
    }

    function handleDelete() {
        if (!deleteCategory) return;
        router.delete(categories.destroy.url(deleteCategory.id), {
            onSuccess: () => setDeleteCategory(null),
        });
    }

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name_category',
            header: 'Nombre',
            cell: ({ row }) => (
                <Link
                    href={categories.show.url(row.original.id)}
                    className="hover:text-primary font-medium"
                >
                    {row.original.name_category}
                </Link>
            ),
        },
        {
            accessorKey: 'description_category',
            header: 'Descripción',
            cell: ({ row }) => (
                <span className="text-muted-foreground line-clamp-1 max-w-[300px]">
                    {row.original.description_category ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: 'products_count',
            header: () => <span className="text-center">Productos</span>,
            cell: ({ row }) => (
                <span className="text-muted-foreground block text-center">
                    {row.original.products_count}
                </span>
            ),
        },
        {
            id: 'children_count',
            header: () => <span className="text-center">Subcategorías</span>,
            cell: ({ row }) => (
                <span className="text-muted-foreground block text-center">
                    {row.original.children?.length ?? 0}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <span className="text-center">Acciones</span>,
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.get(categories.edit.url(row.original.id));
                        }}
                    >
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCategory(row.original);
                        }}
                    >
                        <Trash2Icon className="text-destructive size-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Categorías" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Categorías"
                    description="Gestión de categorías del inventario"
                >
                    <Button asChild>
                        <Link href={categories.create.url()}>
                            <PlusIcon className="size-4" />
                            Nueva categoría
                        </Link>
                    </Button>
                </PageHeader>

                <FilterBar>
                    <SearchInput
                        value={filters.search ?? ''}
                        onChange={handleSearch}
                        placeholder="Buscar categoría..."
                        className="w-full sm:w-80"
                    />
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={pagination.data}
                    pagination={pagination}
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Buscar categoría..."
                    emptyTitle="Sin categorías"
                    emptyDescription="No se encontraron categorías. Crea una nueva para comenzar."
                    emptyAction={{
                        label: 'Nueva categoría',
                        href: categories.create.url(),
                    }}
                />

                <ConfirmDialog
                    open={deleteCategory !== null}
                    onOpenChange={(open) => !open && setDeleteCategory(null)}
                    title="Eliminar categoría"
                    description={`¿Estás seguro de eliminar la categoría "${deleteCategory?.name_category}"? Los productos se moverán a "Sin categoría".`}
                    confirmText="Eliminar"
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categorías', href: categories.index.url() },
    ],
};
