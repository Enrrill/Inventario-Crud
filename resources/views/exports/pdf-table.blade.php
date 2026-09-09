<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ ucfirst(str_replace('_', ' ', $filename)) }}</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; margin: 20px; }
        h1 { font-size: 16px; margin-bottom: 5px; }
        .meta { font-size: 9px; color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; font-size: 9px; }
        td { font-size: 9px; }
        tr:nth-child(even) { background-color: #f9fafb; }
    </style>
</head>
<body>
    <h1>{{ ucfirst(str_replace('_', ' ', $filename)) }}</h1>
    <div class="meta">Generado: {{ now()->format('d/m/Y H:i') }}</div>

    <table>
        <thead>
            <tr>
                @foreach ($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($data as $row)
                <tr>
                    @foreach ($row as $value)
                        <td>{{ $value }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($headers) }}" style="text-align: center;">No hay datos disponibles</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
