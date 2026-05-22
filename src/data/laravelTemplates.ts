export interface CodeSnippet {
  fileName: string;
  language: string;
  group: 'database' | 'backend' | 'frontend' | 'realtime' | 'architecture';
  description: string;
  code: string;
}

export const laravelTemplates: CodeSnippet[] = [
  {
    fileName: "2026_05_22_000001_create_restaurant_pos_schema.php",
    language: "php",
    group: "database",
    description: "Database Migration Schema with PostgreSQL indexes, UUID primary keys, and Audit Log structures.",
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. TABLES
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('number')->unique();
            $table->integer('capacity');
            $table->string('status')->default('available'); // available, occupied, reserved
            $table->string('current_session_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'number']);
        });

        // 2. CATEGORIES
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->default('utensils');
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. PRODUCTS
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->foreignUuid('category_id')->constrained('categories')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->decimal('price_cost', 12, 2);
            $table->decimal('price_sell', 12, 2);
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->boolean('happy_hour_active')->default(false);
            $table->integer('stock')->default(0);
            $table->integer('min_stock_alert')->default(10);
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'is_available']);
            $table->index(['sku', 'barcode']);
        });

        // 4. PRODUCT VARIANTS
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->string('name'); // e.g., Small, Large, Extra Hot
            $table->decimal('price_cost', 12, 2);
            $table->decimal('price_sell', 12, 2);
            $table->string('sku')->unique();
            $table->integer('stock')->default(0);
            $table->timestamps();
        });

        // 5. CUSTOMERS
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('email')->nullable()->unique();
            $table->integer('loyalty_points')->default(0);
            $table->string('member_level')->default('Silver'); // Silver, Gold, Platinum
            $table->decimal('total_spend', 12, 2)->default(0.00);
            $table->integer('visit_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('phone');
        });

        // 6. CASHIER SHIFTS
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('staff_id')->constrained('users')->onDelete('restrict');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_cash_float', 12, 2);
            $table->decimal('expected_ending_cash', 12, 2)->nullable();
            $table->decimal('actual_declared_cash', 12, 2)->nullable();
            $table->decimal('cash_difference', 12, 2)->nullable();
            $table->string('shift_status')->default('open'); // open, closed, reconciled
            $table->timestamps();

            $table->index(['staff_id', 'shift_status']);
        });

        // 7. ORDERS
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_no')->unique();
            $table->string('dining_type'); // dine_in, takeaway, delivery
            $table->integer('table_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2); // 10%
            $table->decimal('service_charge', 12, 2)->default(0); // 5%
            $table->decimal('total', 12, 2);
            $table->string('status')->default('pending'); // pending, preparing, ready, completed, voided
            $table->string('payment_method')->nullable(); // cash, debit, qris, split
            $table->text('payment_details')->nullable(); // JSON configuration of multi-pay
            $table->decimal('cash_paid', 12, 2)->nullable();
            $table->decimal('cash_change', 12, 2)->nullable();
            $table->foreignUuid('staff_id')->constrained('users')->onDelete('restrict');
            $table->foreignUuid('shift_id')->nullable()->constrained('cashier_shifts')->onDelete('set null');
            $table->boolean('is_hold')->default(false);
            $table->string('hold_label')->nullable();
            $table->string('void_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'invoice_no']);
            $table->index('created_at');
        });

        // 8. ORDER ITEMS
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignUuid('product_id')->constrained('products')->onDelete('restrict');
            $table->foreignUuid('variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->string('product_name');
            $table->string('variant_name')->nullable();
            $table->integer('quantity');
            $table->decimal('price_sell', 12, 2);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, cooking, ready, served, voided
            $table->timestamps();
        });

        // 9. KITCHEN TICKETS
        Schema::create('kitchen_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('invoice_no');
            $table->integer('table_number')->nullable();
            $table->string('dining_type');
            $table->string('status')->default('pending'); // pending, preparing, ready, completed
            $table->integer('prep_minutes_estimated')->default(15);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        // 10. STOCK MUTATIONS / INVENTORY LOGS
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->string('product_name');
            $table->string('type'); // stock_in, stock_out, mutation_add, mutation_sub, opname, sales_deduction
            $table->integer('quantity_change');
            $table->integer('previous_stock');
            $table->integer('current_stock');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('restrict');
            $table->string('user_name');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 11. AUDIT LOGS / SHIELD ACTIVITY
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('user_name');
            $table->string('role');
            $table->string('action');
            $table->string('resource');
            $table->text('details');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('kitchen_tickets');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cashier_shifts');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('restaurant_tables');
    }
};`
  },
  {
    fileName: "OrderRepositoryInterface.php",
    language: "php",
    group: "backend",
    description: "Repository Pattern interface separating data query layer from business models for ACID operations.",
    code: `<?php

namespace App\\Repositories\\Contracts;

use App\\Models\\Order;
use App\\DTOs\\OrderCheckoutDTO;
use Illuminate\\Support\\Collection;
use Illuminate\\Pagination\\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function getActiveOrders(array $filters): LengthAwarePaginator;
    
    public function findByInvoice(string $invoiceNo): ?Order;
    
    public function createWithTransaction(OrderCheckoutDTO $dto): Order;
    
    public function voidOrder(string $orderId, string $reason, string $staffId): Order;
    
    public function getSalesIntervalBreakdown(string $startDate, string $endDate): Collection;
    
    public function getBestSellers(int $limit): Collection;
}`
  },
  {
    fileName: "OrderService.php",
    language: "php",
    group: "backend",
    description: "SOLID Service Layer handles full-stack calculations, inventory offsets, promotions, and cash register updates within a safe DB Transaction.",
    code: `<?php

namespace App\\Services;

use App\\Repositories\\Contracts\\OrderRepositoryInterface;
use App\\Repositories\\Contracts\\ProductRepositoryInterface;
use App\\Repositories\\Contracts\\InventoryRepositoryInterface;
use App\\DTOs\\OrderCheckoutDTO;
use App\\Events\\OrderCreatedEvent;
use Illuminate\\Support\\Facades\\DB;
use App\\Exceptions\\InsufficientInventoryException;

class OrderService
{
    protected $orderRepo;
    protected $productRepo;
    protected $inventoryRepo;

    public function __construct(
        OrderRepositoryInterface $orderRepo,
        ProductRepositoryInterface $productRepo,
        InventoryRepositoryInterface $inventoryRepo
    ) {
        $this->orderRepo = $orderRepo;
        $this->productRepo = $productRepo;
        $this->inventoryRepo = $inventoryRepo;
    }

    /**
     * Executes modern checkout processing under transactional lock.
     */
    public function checkout(OrderCheckoutDTO $dto)
    {
        return DB::transaction(function () use ($dto) {
            // 1. Double check and hold inventories
            foreach ($dto->items as $item) {
                $stock = $this->productRepo->getAvailableStock($item['product_id'], $item['variant_id'] ?? null);
                if ($stock < $item['quantity']) {
                    throw new InsufficientInventoryException("Stok tidak mencukupi untuk item: {$item['product_name']}");
                }
            }

            // 2. Pricing and promotions audits
            $subtotal = 0;
            foreach ($dto->items as &$item) {
                $price = $this->productRepo->resolveCurrentPrice(
                    $item['product_id'], 
                    $item['variant_id'] ?? null,
                    $dto->isHappyHour
                );
                $item['price_sell'] = $price;
                $subtotal += $price * $item['quantity'];
            }

            // 3. Deduct Stock and Mutate Inventory
            foreach ($dto->items as $item) {
                $this->productRepo->deductInventory(
                    $item['product_id'], 
                    $item['variant_id'] ?? null, 
                    $item['quantity']
                );

                $this->inventoryRepo->logMutation([
                    'product_id' => $item['product_id'],
                    'type' => 'sales_deduction',
                    'quantity_change' => -$item['quantity'],
                    'notes' => "Sales deduction for invoice"
                ]);
            }

            // 4. Save Order
            $dto->subtotal = $subtotal;
            $order = $this->orderRepo->createWithTransaction($dto);

            // 5. Synchronous and Event Triggering for Reverb Realtime Channels
            event(new OrderCreatedEvent($order));

            return $order;
        });
    }
}`
  },
  {
    fileName: "OrderController.php",
    language: "php",
    group: "backend",
    description: "Centralized REST API Response Controller supporting structured formats, exception mappings, and validation rules.",
    code: `<?php

namespace App\\Http\\Controllers\\Api\\V1;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\CheckoutRequest;
use App\\Services\\OrderService;
use App\\DTOs\\OrderCheckoutDTO;
use App\\Http\\Resources\\OrderResource;
use Illuminate\\Http\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\Response;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * POST /api/v1/orders/checkout
     * Enterprise secure transaction entry point
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        try {
            $dto = OrderCheckoutDTO::fromRequest($request);
            
            $order = $this->orderService->checkout($dto);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dibuat.',
                'data' => new OrderResource($order)
            ], Response::HTTP_CREATED);

        } catch (\\Exception $e) {
            activity('order_failure')
                ->causedBy(auth()->user())
                ->withProperties(['payload' => $request->all()])
                ->log($e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses checkout: ' . $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}`
  },
  {
    fileName: "OrderCreatedEvent.php",
    language: "php",
    group: "realtime",
    description: "Laravel Reverb broadcasting configurations emitting real-time telemetry to Kitchen Display Systems (KDS).",
    code: `<?php

namespace App\\Events;

use App\\Models\\Order;
use Illuminate\\Broadcasting\\Channel;
use Illuminate\\Broadcasting\\InteractsWithSockets;
use Illuminate\\Broadcasting\\PresenceChannel;
use Illuminate\\Broadcasting\\PrivateChannel;
use Illuminate\\Contracts\\Broadcasting\\ShouldBroadcastNow;
use Illuminate\\Foundation\\Events\\Dispatchable;
use Illuminate\\Queue\\SerializesModels;

class OrderCreatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['items', 'table']);
    }

    /**
     * Broadcast to WebSocket channels for instant UI state synchronization
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('restaurant-global'),
            new PrivateChannel('kitchen-terminal'),
            new PrivateChannel("cashier-panel.{$this->order->staff_id}")
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'invoice_no' => $this->order->invoice_no,
            'table_number' => $this->order->table_number,
            'dining_type' => $this->order->dining_type,
            'customer_name' => $this->order->customer_name,
            'total' => $this->order->total,
            'status' => $this->order->status,
            'items' => $this->order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'notes' => $item->notes,
                    'status' => $item->status,
                ];
            }),
            'timestamp' => $this->order->created_at->toIso8601String()
        ];
    }
}`
  },
  {
    fileName: "manifest.json",
    language: "json",
    group: "frontend",
    description: "Next.js 15 App router PWA Configuration enabling offline digital menus on any customer tablet.",
    code: `{
  "short_name": "SaaS POS",
  "name": "Enterprise Restaurant POS & Table Systems",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icons/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/?pwa=true",
  "background_color": "#0D0E12",
  "theme_color": "#EF4444",
  "display": "standalone",
  "orientation": "any"
}`
  }
];
