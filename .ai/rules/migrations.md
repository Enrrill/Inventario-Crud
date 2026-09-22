---
paths:
  - 'database/migrations/**'
---

# Migrations

## Columnas de negocio llevan sufijo por entidad
Las tablas de negocio usan columnas con sufijo por entidad: name_category/description_category/parent_category_id; name_supplier/email_supplier/...; sku_product/name_product/current_stock_product/unit_price_product/is_active_product; type_movement/quantity_movement/previous_stock_movement/new_stock_movement/reference_movement. Nunca usar nombres genéricos (name, current_stock, type) en modelos, requests, factories ni docs. audit_logs tiene batch_id (uuid nullable, índice) para correlacionar lotes.
