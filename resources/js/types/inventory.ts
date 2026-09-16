import type { User } from '@/types/auth';

export type Category = {
    id: number;
    name_category: string;
    description_category: string | null;
    parent_category_id: number | null;
    parent?: Category;
    children?: Category[];
    products_count: number;
    created_at: string;
    updated_at: string;
};

export type Supplier = {
    id: number;
    name_supplier: string;
    contact_name_supplier: string | null;
    email_supplier: string | null;
    phone_supplier: string | null;
    address_supplier: string | null;
    products_count: number;
    created_at: string;
    updated_at: string;
};

export type Product = {
    id: number;
    sku_product: string;
    name_product: string;
    description_product: string | null;
    category_id: number;
    supplier_id: number | null;
    unit_price_product: number;
    unit_of_measure_product: string;
    minimum_stock_product: number;
    current_stock_product: number;
    is_active_product: boolean;
    category?: Category;
    supplier?: Supplier;
    created_at: string;
    updated_at: string;
};

export type StockMovement = {
    id: number;
    product_id: number;
    type_movement: StockMovementType;
    quantity_movement: number;
    previous_stock_movement: number;
    new_stock_movement: number;
    reference_movement: string | null;
    notes_movement: string | null;
    user_id: number;
    product?: Product;
    user?: User;
    created_at: string;
    updated_at: string;
};

export type StockMovementType = 'entry' | 'exit' | 'adjustment';

export type StockMovementTypeOption = {
    value: StockMovementType;
    label: string;
};

export type MovementFormData = {
    product_id: string;
    type_movement: StockMovementType | '';
    quantity_movement: string;
};

export type BatchMovementsPayload = {
    movements: Array<{
        product_id: number;
        type_movement: StockMovementType;
        quantity_movement: number;
    }>;
    reference_movement: string;
    notes_movement: string;
};

export type DashboardStats = {
    total_products: number;
    low_stock_products: number;
    total_categories: number;
    total_suppliers: number;
    inventory_value: number;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export type PaginatedLinks = {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
};

export type AuditEvent = 'created' | 'updated' | 'deleted';

export type AuditLog = {
    id: number;
    user_id: number | null;
    auditable_type: string;
    auditable_id: number;
    batch_id: string | null;
    event: AuditEvent;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    user?: User;
    created_at: string;
    updated_at: string;
};

export type ReportSummaryItem = {
    count: number;
    value: number;
};

export type ReportSummary = {
    total_products: number;
    total_value: number;
    by_category: Record<string, ReportSummaryItem>;
    by_supplier: Record<string, ReportSummaryItem>;
    top_products: Product[];
};

export type ReportMovementSummary = {
    total_movements: number;
    by_type: Array<{
        type_movement: StockMovementType;
        total: number;
        total_quantity: number;
    }>;
};

export type ReportStockStatusSummary = {
    total_active: number;
    out_of_stock: Product[];
    low_stock: Product[];
    normal_stock: Product[];
    by_category: Record<string, {
        total: number;
        out_of_stock: number;
        low_stock: number;
    }>;
};

export type UserFilter = {
    search?: string;
    role?: string;
};

export type AuditFilter = {
    user_id?: number;
    auditable_type?: string;
    event?: AuditEvent;
    date_from?: string;
    date_to?: string;
};
