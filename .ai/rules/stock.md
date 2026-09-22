---
paths:
  - 'app/Actions/Stock/**'
---

# Stock

## Movimientos de stock siempre vía lote
POST /movements siempre pasa por StoreBatchMovementsRequest (movements[] min 1 max 20, sin productos duplicados, pre-valida stock de salidas) y RegisterBatchMovementsAction: una sola DB::transaction, lockForUpdate por producto, UUID de lote en Context audit_batch_id (leen Auditable y AuditLog::scopeForBatch; limpiar en finally). RegisterEntryAction/RegisterExitAction/RegisterAdjustmentAction son legacy: ningún controller los invoca. Employee no puede enviar adjustment (bloqueado en controller con flash error).
