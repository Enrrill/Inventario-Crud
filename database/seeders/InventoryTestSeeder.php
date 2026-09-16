<?php

namespace Database\Seeders;

use App\Enums\StockMovementType;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InventoryTestSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE stock_movements CASCADE');
        DB::statement('TRUNCATE products CASCADE');
        DB::statement('TRUNCATE categories CASCADE');
        DB::statement('TRUNCATE suppliers CASCADE');
        DB::statement('TRUNCATE audit_logs CASCADE');
        DB::statement('TRUNCATE sessions CASCADE');
        DB::statement('TRUNCATE password_reset_tokens CASCADE');
        User::where('email', 'enrrill@gmail.com')->delete();

        $users = $this->createUsers();
        $admin = $users['admin'];

        Auth::login($admin);

        $categories = $this->createCategories();
        $suppliers = $this->createSuppliers();
        $products = $this->createProducts($categories, $suppliers);
        $this->createMovements($products, $users);

        Auth::logout();

        $userCount = count($users);
        $this->command->info("Se crearon {$userCount} usuarios (1 admin principal + ".($userCount - 1).' adicionales).');
    }

    private function createUsers(): array
    {
        $admin = User::factory()->create([
            'name' => 'Enrrill',
            'email' => 'enrrill@gmail.com',
            'password' => Hash::make('enrrill22'),
            'role' => UserRole::Admin,
        ]);

        $adminSecundario = User::factory()->admin()->create([
            'name' => 'Carlos Admin',
            'email' => 'carlos.admin@gmail.com',
            'password' => Hash::make('password'),
        ]);

        $empleado1 = User::factory()->create([
            'name' => 'María Empleada',
            'email' => 'maria.empleada@gmail.com',
            'password' => Hash::make('password'),
        ]);

        $empleado2 = User::factory()->create([
            'name' => 'Pedro Empleado',
            'email' => 'pedro.empleado@gmail.com',
            'password' => Hash::make('password'),
        ]);

        $empleado3 = User::factory()->create([
            'name' => 'Ana Trabajadora',
            'email' => 'ana.trabajadora@gmail.com',
            'password' => Hash::make('password'),
        ]);

        return [
            'admin' => $admin,
            'admin_secundario' => $adminSecundario,
            'empleado1' => $empleado1,
            'empleado2' => $empleado2,
            'empleado3' => $empleado3,
        ];
    }

    private function createCategories(): array
    {
        $data = [
            'Electrónica' => [
                'description' => 'Dispositivos y componentes electrónicos',
                'children' => [
                    'Computadoras' => 'Laptops, desktops y componentes',
                    'Celulares' => 'Smartphones y accesorios móviles',
                    'Accesorios' => 'Cables, cargadores y periféricos',
                ],
            ],
            'Ropa' => [
                'description' => 'Prendas de vestir y moda',
                'children' => [
                    'Camisas' => 'Camisas formales y casuales',
                    'Pantalones' => 'Jeans, pantalones formales y deportivos',
                    'Calzado' => 'Zapatos, tenis y sandalias',
                ],
            ],
            'Alimentos' => [
                'description' => 'Productos alimenticios y bebidas',
                'children' => [
                    'Bebidas' => 'Refrescos, jugos y agua',
                    'Snacks' => 'Botanas, galletas y dulces',
                ],
            ],
            'Hogar' => [
                'description' => 'Artículos para el hogar',
                'children' => [
                    'Cocina' => 'Utensilios y electrodomésticos menores',
                    'Limpieza' => 'Productos de limpieza doméstica',
                ],
            ],
        ];

        $categories = [];

        Category::withoutEvents(function () use ($data, &$categories) {
            foreach ($data as $name => $info) {
                $parent = Category::create([
                    'name_category' => $name,
                    'description_category' => $info['description'],
                    'parent_category_id' => null,
                ]);
                $categories[$name] = $parent;

                foreach ($info['children'] as $childName => $childDesc) {
                    $child = Category::create([
                        'name_category' => $childName,
                        'description_category' => $childDesc,
                        'parent_category_id' => $parent->id,
                    ]);
                    $categories[$childName] = $child;
                }
            }
        });

        return $categories;
    }

    private function createSuppliers(): array
    {
        $suppliersData = [
            [
                'name_supplier' => 'TechVenezuela C.A.',
                'contact_name_supplier' => 'Carlos Mendoza',
                'email_supplier' => 'ventas@techvenezuela.com',
                'phone_supplier' => '+58-212-5551234',
                'address_supplier' => 'Av. Principal, Caracas',
            ],
            [
                'name_supplier' => 'ImportadoraCaracas',
                'contact_name_supplier' => 'María González',
                'email_supplier' => 'compras@importadoracc.com',
                'phone_supplier' => '+58-212-5555678',
                'address_supplier' => 'Calle 5, Centro Comercial, Caracas',
            ],
            [
                'name_supplier' => 'DistribuidoraGlobal S.R.L.',
                'contact_name_supplier' => 'José Rodríguez',
                'email_supplier' => 'info@distribuidoraglobal.com',
                'phone_supplier' => '+58-241-5559012',
                'address_supplier' => 'Zona Industrial, Valencia',
            ],
            [
                'name_supplier' => 'Alimentos del Sur C.A.',
                'contact_name_supplier' => 'Ana Martínez',
                'email_supplier' => 'ventas@alimentosdelsur.com',
                'phone_supplier' => '+58-261-5553456',
                'address_supplier' => 'Av. 5 de Julio, Maracaibo',
            ],
            [
                'name_supplier' => 'ModaTotal',
                'contact_name_supplier' => 'Luis Hernández',
                'email_supplier' => 'contacto@modatotal.com',
                'phone_supplier' => '+58-241-5557890',
                'address_supplier' => 'CC La Granja, Valencia',
            ],
            [
                'name_supplier' => 'HogarExpress',
                'contact_name_supplier' => 'Carmen López',
                'email_supplier' => 'pedidos@hogarexpress.com',
                'phone_supplier' => '+58-212-5552345',
                'address_supplier' => 'Av. Libertador, Caracas',
            ],
            [
                'name_supplier' => 'ElectroParts Venezuela',
                'contact_name_supplier' => 'Roberto Díaz',
                'email_supplier' => 'ventas@electropartsVE.com',
                'phone_supplier' => '+58-241-5556789',
                'address_supplier' => 'Zona Industrial, Guatire',
            ],
            [
                'name_supplier' => 'Distribuciones Andinas',
                'contact_name_supplier' => 'Patricia Silva',
                'email_supplier' => 'compras@distandinas.com',
                'phone_supplier' => '+58-274-5551234',
                'address_supplier' => 'Calle Principal, Barquisimeto',
            ],
        ];

        $suppliers = [];

        Supplier::withoutEvents(function () use ($suppliersData, &$suppliers) {
            foreach ($suppliersData as $data) {
                $suppliers[] = Supplier::create($data);
            }
        });

        return $suppliers;
    }

    private function createProducts(array $categories, array $suppliers): array
    {
        $productsData = [
            // Electrónica > Computadoras (5)
            ['name' => 'Laptop HP Pavilion 15', 'sku' => 'ELEC-COMP-001', 'cat' => 'Computadoras', 'sup' => 0, 'price' => 899.99, 'unit' => 'Pieza', 'min' => 5, 'stock' => 12],
            ['name' => 'Desktop Dell Inspiron', 'sku' => 'ELEC-COMP-002', 'cat' => 'Computadoras', 'sup' => 0, 'price' => 649.99, 'unit' => 'Pieza', 'min' => 3, 'stock' => 8],
            ['name' => 'Monitor LG 24 pulgadas', 'sku' => 'ELEC-COMP-003', 'cat' => 'Computadoras', 'sup' => 6, 'price' => 189.99, 'unit' => 'Pieza', 'min' => 5, 'stock' => 15],
            ['name' => 'Teclado mecánico Redragon', 'sku' => 'ELEC-COMP-004', 'cat' => 'Computadoras', 'sup' => 6, 'price' => 45.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 25],
            ['name' => 'Impresora Epson L3250', 'sku' => 'ELEC-COMP-005', 'cat' => 'Computadoras', 'sup' => 0, 'price' => 249.99, 'unit' => 'Pieza', 'min' => 3, 'stock' => 6],

            // Electrónica > Celulares (3)
            ['name' => 'Samsung Galaxy A54', 'sku' => 'ELEC-CELL-001', 'cat' => 'Celulares', 'sup' => 1, 'price' => 329.99, 'unit' => 'Pieza', 'min' => 5, 'stock' => 18],
            ['name' => 'iPhone 15 Pro', 'sku' => 'ELEC-CELL-002', 'cat' => 'Celulares', 'sup' => 1, 'price' => 1199.99, 'unit' => 'Pieza', 'min' => 3, 'stock' => 7],
            ['name' => 'Xiaomi Redmi Note 12', 'sku' => 'ELEC-CELL-003', 'cat' => 'Celulares', 'sup' => 1, 'price' => 199.99, 'unit' => 'Pieza', 'min' => 8, 'stock' => 22],

            // Electrónica > Accesorios (7)
            ['name' => 'Cable USB-C 2m', 'sku' => 'ELEC-ACCE-001', 'cat' => 'Accesorios', 'sup' => 6, 'price' => 8.99, 'unit' => 'Pieza', 'min' => 50, 'stock' => 120],
            ['name' => 'Cargador inalámbrico', 'sku' => 'ELEC-ACCE-002', 'cat' => 'Accesorios', 'sup' => 6, 'price' => 24.99, 'unit' => 'Pieza', 'min' => 15, 'stock' => 35],
            ['name' => 'Audífonos Bluetooth JBL', 'sku' => 'ELEC-ACCE-003', 'cat' => 'Accesorios', 'sup' => 0, 'price' => 59.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 28],
            ['name' => 'Mouse Logitech G502', 'sku' => 'ELEC-ACCE-004', 'cat' => 'Accesorios', 'sup' => 6, 'price' => 39.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 22],
            ['name' => 'Webcam HD 1080p', 'sku' => 'ELEC-ACCE-005', 'cat' => 'Accesorios', 'sup' => 0, 'price' => 34.99, 'unit' => 'Pieza', 'min' => 8, 'stock' => 18],
            ['name' => 'Memoria USB 64GB', 'sku' => 'ELEC-ACCE-006', 'cat' => 'Accesorios', 'sup' => 6, 'price' => 12.99, 'unit' => 'Pieza', 'min' => 30, 'stock' => 0],
            ['name' => 'Router WiFi TP-Link', 'sku' => 'ELEC-ACCE-007', 'cat' => 'Accesorios', 'sup' => 0, 'price' => 29.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 30],

            // Ropa > Camisas (5)
            ['name' => 'Camisa Blanca Formal', 'sku' => 'ROPA-CAMI-001', 'cat' => 'Camisas', 'sup' => 4, 'price' => 35.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 40],
            ['name' => 'Camisa Azul Checking', 'sku' => 'ROPA-CAMI-002', 'cat' => 'Camisas', 'sup' => 4, 'price' => 39.99, 'unit' => 'Pieza', 'min' => 8, 'stock' => 30],
            ['name' => 'Camisa Negra Casual', 'sku' => 'ROPA-CAMI-003', 'cat' => 'Camisas', 'sup' => 4, 'price' => 32.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 35],
            ['name' => 'Polo Deportivo Adidas', 'sku' => 'ROPA-CAMI-004', 'cat' => 'Camisas', 'sup' => 4, 'price' => 29.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 0],
            ['name' => 'Vestido Casual Mujer', 'sku' => 'ROPA-CAMI-005', 'cat' => 'Camisas', 'sup' => 4, 'price' => 55.99, 'unit' => 'Pieza', 'min' => 5, 'stock' => 15],

            // Ropa > Pantalones (4)
            ['name' => 'Jeans Clásico Azul', 'sku' => 'ROPA-PANT-001', 'cat' => 'Pantalones', 'sup' => 4, 'price' => 45.99, 'unit' => 'Pieza', 'min' => 8, 'stock' => 25],
            ['name' => 'Pantalón Formal Negro', 'sku' => 'ROPA-PANT-002', 'cat' => 'Pantalones', 'sup' => 4, 'price' => 49.99, 'unit' => 'Pieza', 'min' => 6, 'stock' => 20],
            ['name' => 'Short Deportivo', 'sku' => 'ROPA-PANT-003', 'cat' => 'Pantalones', 'sup' => 7, 'price' => 22.99, 'unit' => 'Pieza', 'min' => 10, 'stock' => 45],
            ['name' => 'Chaqueta Deportiva', 'sku' => 'ROPA-PANT-004', 'cat' => 'Pantalones', 'sup' => 7, 'price' => 75.99, 'unit' => 'Pieza', 'min' => 4, 'stock' => 3],

            // Ropa > Calzado (3)
            ['name' => 'Tenis Nike Air Max', 'sku' => 'ROPA-CALZ-001', 'cat' => 'Calzado', 'sup' => 4, 'price' => 89.99, 'unit' => 'Par', 'min' => 5, 'stock' => 15],
            ['name' => 'Zapatos Formales Cuero', 'sku' => 'ROPA-CALZ-002', 'cat' => 'Calzado', 'sup' => 7, 'price' => 65.99, 'unit' => 'Par', 'min' => 4, 'stock' => 12],
            ['name' => 'Sandalias Casual', 'sku' => 'ROPA-CALZ-003', 'cat' => 'Calzado', 'sup' => 7, 'price' => 25.99, 'unit' => 'Par', 'min' => 8, 'stock' => 30],

            // Alimentos > Bebidas (4)
            ['name' => 'Agua Mineral 1L', 'sku' => 'ALIM-BEBI-001', 'cat' => 'Bebidas', 'sup' => 3, 'price' => 1.50, 'unit' => 'Litro', 'min' => 100, 'stock' => 250],
            ['name' => 'Jugo de Naranja 1L', 'sku' => 'ALIM-BEBI-002', 'cat' => 'Bebidas', 'sup' => 3, 'price' => 2.99, 'unit' => 'Litro', 'min' => 50, 'stock' => 120],
            ['name' => 'Coca-Cola 2L', 'sku' => 'ALIM-BEBI-003', 'cat' => 'Bebidas', 'sup' => 3, 'price' => 3.50, 'unit' => 'Litro', 'min' => 40, 'stock' => 80],
            ['name' => 'Café Molido 500g', 'sku' => 'ALIM-BEBI-004', 'cat' => 'Bebidas', 'sup' => 3, 'price' => 8.99, 'unit' => 'Kilogramo', 'min' => 20, 'stock' => 45],

            // Alimentos > Snacks (4)
            ['name' => 'Papas Fritas 150g', 'sku' => 'ALIM-SNAC-001', 'cat' => 'Snacks', 'sup' => 3, 'price' => 2.50, 'unit' => 'Pieza', 'min' => 60, 'stock' => 150],
            ['name' => 'Galletas Oreo 117g', 'sku' => 'ALIM-SNAC-002', 'cat' => 'Snacks', 'sup' => 3, 'price' => 3.25, 'unit' => 'Pieza', 'min' => 40, 'stock' => 90],
            ['name' => 'Chocolate Hershey\'s', 'sku' => 'ALIM-SNAC-003', 'cat' => 'Snacks', 'sup' => 3, 'price' => 4.99, 'unit' => 'Pieza', 'min' => 30, 'stock' => 65],
            ['name' => 'Maní Salado 200g', 'sku' => 'ALIM-SNAC-004', 'cat' => 'Snacks', 'sup' => 7, 'price' => 2.99, 'unit' => 'Kilogramo', 'min' => 25, 'stock' => 55],

            // Hogar > Cocina (6)
            ['name' => 'Sartén Antiadherente 28cm', 'sku' => 'HOGA-COCI-001', 'cat' => 'Cocina', 'sup' => 5, 'price' => 29.99, 'unit' => 'Pieza', 'min' => 8, 'stock' => 18],
            ['name' => 'Juego de Ollas 5 piezas', 'sku' => 'HOGA-COCI-002', 'cat' => 'Cocina', 'sup' => 5, 'price' => 89.99, 'unit' => 'Juego', 'min' => 3, 'stock' => 8],
            ['name' => 'Licuadora Oster 10 vel.', 'sku' => 'HOGA-COCI-003', 'cat' => 'Cocina', 'sup' => 2, 'price' => 55.99, 'unit' => 'Pieza', 'min' => 4, 'stock' => 10],
            ['name' => 'Cuchillo Chef Profesional', 'sku' => 'HOGA-COCI-004', 'cat' => 'Cocina', 'sup' => 5, 'price' => 18.99, 'unit' => 'Pieza', 'min' => 6, 'stock' => 14],
            ['name' => 'Reloj Digital Sony', 'sku' => 'HOGA-COCI-005', 'cat' => 'Cocina', 'sup' => 2, 'price' => 15.99, 'unit' => 'Pieza', 'min' => 5, 'stock' => 0],
            ['name' => 'Juego de Sábanas Queen', 'sku' => 'HOGA-COCI-006', 'cat' => 'Cocina', 'sup' => 5, 'price' => 45.99, 'unit' => 'Juego', 'min' => 5, 'stock' => 10],

            // Hogar > Limpieza (5)
            ['name' => 'Detergente Líquido 3L', 'sku' => 'HOGA-LIMP-001', 'cat' => 'Limpieza', 'sup' => 2, 'price' => 12.99, 'unit' => 'Litro', 'min' => 30, 'stock' => 75],
            ['name' => 'Suavizante de Ropa 2L', 'sku' => 'HOGA-LIMP-002', 'cat' => 'Limpieza', 'sup' => 2, 'price' => 9.99, 'unit' => 'Litro', 'min' => 25, 'stock' => 50],
            ['name' => 'Cloro 1L', 'sku' => 'HOGA-LIMP-003', 'cat' => 'Limpieza', 'sup' => 2, 'price' => 2.50, 'unit' => 'Litro', 'min' => 40, 'stock' => 100],
            ['name' => 'Esponjas Pack 6 u.', 'sku' => 'HOGA-LIMP-004', 'cat' => 'Limpieza', 'sup' => 2, 'price' => 4.99, 'unit' => 'Caja', 'min' => 20, 'stock' => 60],
            ['name' => 'Toallas de Baño Pack 4', 'sku' => 'HOGA-LIMP-005', 'cat' => 'Limpieza', 'sup' => 7, 'price' => 29.99, 'unit' => 'Caja', 'min' => 10, 'stock' => 25],
        ];

        $products = [];

        Product::withoutEvents(function () use ($productsData, $categories, $suppliers, &$products) {
            foreach ($productsData as $data) {
                $product = Product::create([
                    'sku_product' => $data['sku'],
                    'name_product' => $data['name'],
                    'description_product' => "Descripción de {$data['name']}",
                    'category_id' => $categories[$data['cat']]->id,
                    'supplier_id' => $suppliers[$data['sup']]->id,
                    'unit_price_product' => $data['price'],
                    'unit_of_measure_product' => $data['unit'],
                    'minimum_stock_product' => $data['min'],
                    'current_stock_product' => $data['stock'],
                    'is_active_product' => true,
                ]);
                $products[] = $product;
            }

            Product::where('sku_product', 'HOGA-COCI-005')->update(['is_active_product' => false]);
            Product::where('sku_product', 'ROPA-CAMI-004')->update(['is_active_product' => false]);
            Product::where('sku_product', 'ELEC-ACCE-006')->update(['is_active_product' => false]);
        });

        return $products;
    }

    private function createMovements(array $products, array $users): void
    {
        $types = [
            StockMovementType::Entry,
            StockMovementType::Exit,
            StockMovementType::Adjustment,
        ];
        $notes = [
            'Recepción de mercancía',
            'Venta al por mayor',
            'Ajuste por inventario',
            'Devolución de cliente',
            'Pedido especial',
            'Revisión de stock',
            'Transferencia entre almacenes',
            'Compra a proveedor',
            'Salida por daño',
            'Ajuste por mermas',
        ];
        $references = [
            'INV-2026-001',
            'INV-2026-002',
            'ORD-2026-015',
            'ORD-2026-016',
            'DEV-2026-003',
            'AJU-2026-001',
            'TRF-2026-002',
            'VTA-2026-045',
            'VTA-2026-046',
            'REQ-2026-008',
        ];

        $userIds = array_column($users, 'id');
        $movementCount = 0;

        foreach ($products as $product) {
            $numMovements = rand(1, 4);
            $currentStock = $product->current_stock_product;

            for ($i = 0; $i < $numMovements; $i++) {
                $type = $types[array_rand($types)];
                $quantity = rand(1, min(30, max(1, $currentStock + 20)));
                $userId = $userIds[array_rand($userIds)];

                $previousStock = $currentStock;

                match ($type) {
                    StockMovementType::Entry => $newStock = $previousStock + $quantity,
                    StockMovementType::Exit => $newStock = max(0, $previousStock - $quantity),
                    StockMovementType::Adjustment => $newStock = max(0, $previousStock + ($quantity % 2 === 0 ? $quantity : -$quantity)),
                };

                Auth::loginUsingId($userId);

                StockMovement::withoutEvents(function () use ($product, $type, $quantity, $previousStock, $newStock, $references, $notes, $userId) {
                    StockMovement::create([
                        'product_id' => $product->id,
                        'type_movement' => $type,
                        'quantity_movement' => $quantity,
                        'previous_stock_movement' => $previousStock,
                        'new_stock_movement' => $newStock,
                        'reference_movement' => $references[array_rand($references)],
                        'notes_movement' => $notes[array_rand($notes)],
                        'user_id' => $userId,
                        'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                    ]);
                });

                $currentStock = $newStock;
                $movementCount++;
            }

            Product::withoutEvents(function () use ($product, $currentStock) {
                $product->update(['current_stock_product' => $currentStock]);
            });
        }

        Auth::loginUsingId($users['admin']['id']);

        $this->command->info("Se crearon {$movementCount} movimientos de stock.");
    }
}
