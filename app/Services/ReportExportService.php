<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Http\Requests\ReportRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use OpenSpout\Common\Entity\Cell;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportExportService
{
    public function exportInventory(string $type, ReportRequest $request): SymfonyResponse
    {
        $query = Product::active()->with('category', 'supplier');

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($supplierId = $request->input('supplier_id')) {
            $query->where('supplier_id', $supplierId);
        }

        $products = $query->orderBy('name_product')->get();

        $data = $products->map(fn ($p) => [
            'SKU' => $p->sku_product,
            'Nombre' => $p->name_product,
            'Categoría' => $p->category?->name_category ?? 'N/A',
            'Proveedor' => $p->supplier?->name_supplier ?? 'N/A',
            'Precio' => number_format($p->unit_price_product, 2),
            'Stock Actual' => $p->current_stock_product,
            'Stock Mínimo' => $p->minimum_stock_product,
            'Valor' => number_format($p->current_stock_product * $p->unit_price_product, 2),
        ]);

        $headers = ['SKU', 'Nombre', 'Categoría', 'Proveedor', 'Precio', 'Stock Actual', 'Stock Mínimo', 'Valor'];

        return $this->export($type, $data, $headers, 'reporte_inventario');
    }

    public function exportMovements(string $type, ReportRequest $request): SymfonyResponse
    {
        $query = StockMovement::with('product', 'user');

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', $dateTo.' 23:59:59');
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($typeMovement = $request->input('type_movement')) {
            $query->where('type_movement', $typeMovement);
        }

        $movements = $query->latest('created_at')->get();

        $data = $movements->map(fn ($m) => [
            'Fecha' => $m->created_at->format('d/m/Y H:i'),
            'Producto' => $m->product?->name_product ?? 'N/A',
            'Tipo' => $m->type_movement instanceof StockMovementType ? $m->type_movement->label() : $m->type_movement,
            'Cantidad' => $m->quantity_movement,
            'Stock Anterior' => $m->previous_stock_movement,
            'Stock Nuevo' => $m->new_stock_movement,
            'Referencia' => $m->reference_movement ?? 'N/A',
            'Usuario' => $m->user?->name ?? 'N/A',
        ]);

        $headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Referencia', 'Usuario'];

        return $this->export($type, $data, $headers, 'reporte_movimientos');
    }

    public function exportStockStatus(string $type, ReportRequest $request): SymfonyResponse
    {
        $query = Product::active()->with('category');

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->get();

        $data = $products->map(function ($p) {
            $status = match (true) {
                $p->current_stock_product === 0 => 'Sin Stock',
                $p->current_stock_product <= $p->minimum_stock_product => 'Stock Bajo',
                default => 'Normal',
            };

            return [
                'SKU' => $p->sku_product,
                'Nombre' => $p->name_product,
                'Categoría' => $p->category?->name_category ?? 'N/A',
                'Stock Actual' => $p->current_stock_product,
                'Stock Mínimo' => $p->minimum_stock_product,
                'Estado' => $status,
            ];
        });

        $headers = ['SKU', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Estado'];

        return $this->export($type, $data, $headers, 'reporte_estado_stock');
    }

    private function export(string $type, Collection $data, array $headers, string $filename): SymfonyResponse
    {
        return match ($type) {
            'csv' => $this->exportCsv($data, $filename, $headers),
            'pdf' => $this->exportPdf($data, $filename, $headers),
            'xlsx' => $this->exportXlsx($data, $filename, $headers),
            default => back(),
        };
    }

    private function exportCsv(Collection $data, string $filename, array $headers): SymfonyResponse
    {
        $callback = function () use ($data, $headers) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, $headers);

            foreach ($data as $row) {
                fputcsv($handle, array_values($row));
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ]);
    }

    private function exportPdf(Collection $data, string $filename, array $headers): SymfonyResponse
    {
        $pdf = Pdf::loadView('exports.pdf-table', [
            'data' => $data,
            'headers' => $headers,
            'filename' => $filename,
        ])->setPaper('letter', 'landscape');

        return $pdf->download("{$filename}.pdf");
    }

    private function exportXlsx(Collection $data, string $filename, array $headers): SymfonyResponse
    {
        $callback = function () use ($data, $headers) {
            $writer = new Writer;

            $writer->openToBrowser("{$filename}.xlsx");

            $headerStyle = (new Style)->setBold(true);
            $headerRow = new Row(array_map(
                fn (string $header) => Cell::fromValue($header, $headerStyle),
                $headers,
            ));
            $writer->addRow($headerRow);

            foreach ($data as $row) {
                $writer->addRow(new Row(array_map(
                    fn ($value) => Cell::fromValue((string) $value),
                    array_values($row),
                )));
            }

            $writer->close();
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xlsx\"",
        ]);
    }
}
