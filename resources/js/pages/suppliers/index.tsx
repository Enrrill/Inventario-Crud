import { Head, Link, router } from '@inertiajs/react';
import { HomeIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { ColumnDef, StockFeatures } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/inventory/confirm-dialog';
import { DataTable } from '@/components/inventory/data-table';
import { FilterBar } from '@/components/inventory/filter-bar';
import { PageHeader } from '@/components/inventory/page-header';
import { SearchInput } from '@/components/inventory/search-input';
import { useQueryParams } from '@/hooks/use-query-params';
import suppliers from '@/routes/suppliers';
import type { PaginatedData, Supplier } from '@/types/inventory';

type SuppliersIndexProps = {
    suppliers: PaginatedData<Supplier>;
    filters: { search?: string; per_page?: string };
    isAdmin: boolean;
};

export default function SuppliersIndex({
    suppliers: pagination,
    isAdmin,
}: SuppliersIndexProps) {
    const [filters, setFilters] = useQueryParams<{ search: string; per_page: string }>();
    const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

    const handleSearch = useCallback(
        (value: string) => {
            setFilters({ search: value });
        },
        [setFilters],
    );

    function handleDelete() {
        if (!deleteSupplier) return;
        router.delete(suppliers.destroy.url(deleteSupplier.id), {
            onError: () => setDeleteSupplier(null),
        });
    }

    const columns: ColumnDef<StockFeatures, Supplier>[] = [
        {
            accessorKey: 'name_supplier',
            header: 'Nombre',
            meta: { className: 'min-w-[200px]' },
            cell: ({ row }) => (
                <Link
                    href={suppliers.show.url(row.original.id)}
                    className="hover:text-primary font-medium"
                >
                    {row.original.name_supplier}
                </Link>
            ),
        },
        {
            accessorKey: 'contact_name_supplier',
            header: 'Contacto',
            meta: { className: 'min-w-[180px]' },
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.contact_name_supplier ?? '—'}
                </span>
            ),
        },
        ...(isAdmin
            ? [
                  {
                      accessorKey: 'email_supplier',
                      header: 'Email',
                      meta: { className: 'min-w-[180px]' },
                      cell: ({ row }) => (
                          <span className="text-muted-foreground">
                              {row.original.email_supplier ?? '—'}
                          </span>
                      ),
                  },
                  {
                      accessorKey: 'phone_supplier',
                      header: 'Teléfono',
                      meta: { className: 'min-w-[140px]' },
                      cell: ({ row }) => (
                          <span className="text-muted-foreground">
                              {row.original.phone_supplier ?? '—'}
                          </span>
                      ),
                  },
              ]
            : []),
        {
            accessorKey: 'products_count',
            header: 'Productos',
            meta: { className: 'w-28 text-center', headerClassName: 'text-center' },
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.products_count}
                </span>
            ),
        },
        ...(isAdmin
            ? [
                  {
                      id: 'actions',
                      header: 'Acciones',
                      meta: { className: 'w-24 text-center', headerClassName: 'text-center' },
                      cell: ({ row }) => (
                          <div className="flex items-center justify-center gap-1">
                              <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      router.get(suppliers.edit.url(row.original.id));
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
                                      setDeleteSupplier(row.original);
                                  }}
                              >
                                  <Trash2Icon className="text-destructive size-4" />
                                  <span className="sr-only">Eliminar</span>
                              </Button>
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title="Proveedores" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Proveedores"
                    description="Gestión de proveedores del inventario"
                >
                    {isAdmin && (
                        <Button asChild>
                            <Link href={suppliers.create.url()}>
                                <PlusIcon className="size-4" />
                                Nuevo proveedor
                            </Link>
                        </Button>
                    )}
                </PageHeader>

                <FilterBar>
                    <SearchInput
                        value={filters.search ?? ''}
                        onChange={handleSearch}
                        placeholder="Buscar proveedor..."
                        className="w-full sm:w-80"
                    />
                </FilterBar>

                <DataTable
                    columns={columns}
                    data={pagination.data}
                    pagination={pagination}
                    showPerPage
                    onPerPageChange={(perPage) => setFilters({ per_page: String(perPage) })}
                    emptyTitle="Sin proveedores"
                    emptyDescription="No se encontraron proveedores. Crea uno nuevo para comenzar."
                    emptyAction={
                        isAdmin
                            ? {
                                  label: 'Nuevo proveedor',
                                  href: suppliers.create.url(),
                              }
                            : undefined
                    }
                />

                <ConfirmDialog
                    open={deleteSupplier !== null}
                    onOpenChange={(open) => !open && setDeleteSupplier(null)}
                    title="Eliminar proveedor"
                    description={
                        deleteSupplier?.products_count
                            ? `No se puede eliminar "${deleteSupplier?.name_supplier}" porque tiene productos asociados.`
                            : `¿Estás seguro de eliminar el proveedor "${deleteSupplier?.name_supplier}"?`
                    }
                    confirmText="Eliminar"
                    variant={
                        deleteSupplier?.products_count ? 'default' : 'destructive'
                    }
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'StockNow', href: '/dashboard', icon: HomeIcon },
        { title: 'Proveedores', href: suppliers.index.url() },
    ],
};
