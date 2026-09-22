---
paths:
  - routes/web.php
---

# Routes

## Gate de permisos: role:admin en rutas, no policies
El gate efectivo de escrituras (categories/suppliers/products create-store-edit-update-destroy, users, audit, reports/inventory) es el middleware `role:admin` a nivel de ruta, NO las policies: las policies de Category/Supplier/Product devuelven true en create/update para employee pero la ruta responde 403. Employee solo tiene lectura (index/show) en categorías/proveedores/productos; en movimientos solo entry/exit (sin adjustment); en reportes ve solo sus movimientos y no acceso a /reports/inventory. Verificado por tests/Feature/EmployeePermissionsTest.php.
