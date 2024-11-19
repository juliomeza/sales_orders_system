-- CreateTable
CREATE TABLE "statuses" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "customerId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_warehouses" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "customer_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "capacity" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_types" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "order_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_services" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "carrierId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "carrier_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "customerId" INTEGER NOT NULL,
    "accountType" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "orderTypeId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "shipToAccountId" INTEGER NOT NULL,
    "billToAccountId" INTEGER NOT NULL,
    "carrierId" INTEGER NOT NULL,
    "carrierServiceId" INTEGER NOT NULL,
    "warehouseId" INTEGER,
    "expectedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "projectId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerId" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" SERIAL NOT NULL,
    "lookupCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "modified_by" INTEGER,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statuses_code_key" ON "statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_lookupCode_key" ON "users"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_lookupCode_key" ON "customers"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "customer_warehouses_customerId_warehouseId_key" ON "customer_warehouses"("customerId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_lookupCode_key" ON "warehouses"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "order_types_lookupCode_key" ON "order_types"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "carrier_services_lookupCode_key" ON "carrier_services"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_lookupCode_key" ON "accounts"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "orders_lookupCode_key" ON "orders"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "materials_lookupCode_key" ON "materials"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "projects_lookupCode_key" ON "projects"("lookupCode");

-- CreateIndex
CREATE UNIQUE INDEX "carriers_lookupCode_key" ON "carriers"("lookupCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_warehouses" ADD CONSTRAINT "customer_warehouses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_warehouses" ADD CONSTRAINT "customer_warehouses_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_services" ADD CONSTRAINT "carrier_services_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderTypeId_fkey" FOREIGN KEY ("orderTypeId") REFERENCES "order_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipToAccountId_fkey" FOREIGN KEY ("shipToAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_billToAccountId_fkey" FOREIGN KEY ("billToAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_carrierServiceId_fkey" FOREIGN KEY ("carrierServiceId") REFERENCES "carrier_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
