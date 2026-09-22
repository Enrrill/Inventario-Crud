---
paths:
  - 'app/Services/**'
---

# Services

## Export XLSX con openspout, no maatwebsite/excel
La exportación XLSX usa openspout/openspout (Writer directo), NO maatwebsite/excel. ReportExportService expone métodos públicos exportInventory/exportMovements/exportStockStatus(string $type, ReportRequest); los helpers exportCsv/exportPdf/exportXlsx son privados y todos reciben Collection de datos (PDF renderiza la view exports.pdf-table con dompdf).
