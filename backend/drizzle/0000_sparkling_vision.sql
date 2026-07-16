-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."audit_action_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');--> statement-breakpoint
CREATE TYPE "public"."background_job_status_enum" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING');--> statement-breakpoint
CREATE TYPE "public"."cart_status_enum" AS ENUM('ACTIVE', 'ABANDONED', 'CONVERTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."customer_token_purpose_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE', 'PHONE_VERIFICATION');--> statement-breakpoint
CREATE TYPE "public"."customer_type_enum" AS ENUM('registered', 'guest');--> statement-breakpoint
CREATE TYPE "public"."delivery_assignment_status_enum" AS ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."delivery_event_type_enum" AS ENUM('ASSIGNED', 'PICKED_UP', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED', 'LOCATION_UPDATE');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type_enum" AS ENUM('purchase', 'sale', 'reservation', 'release', 'adjustment', 'return', 'loss');--> statement-breakpoint
CREATE TYPE "public"."inventory_reference_enum" AS ENUM('ORDER', 'PURCHASE_ORDER', 'TRANSFER', 'RETURN', 'MANUAL', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('pending', 'issued', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_status_enum" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."media_type_enum" AS ENUM('image', 'video', 'audio', 'document', 'other');--> statement-breakpoint
CREATE TYPE "public"."menu_location_enum" AS ENUM('HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE');--> statement-breakpoint
CREATE TYPE "public"."notification_channel_enum" AS ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ORDER', 'PAYMENT', 'PROMOTION');--> statement-breakpoint
CREATE TYPE "public"."order_status_enum" AS ENUM('created', 'payment_pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_intent_status_enum" AS ENUM('created', 'pending', 'authorized', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method_enum" AS ENUM('CARD', 'PSE', 'CASH', 'BANK_TRANSFER', 'NEQUI', 'DAVIPLATA');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."promotion_condition_type_enum" AS ENUM('MIN_AMOUNT', 'MIN_QUANTITY', 'CUSTOMER_TYPE', 'PRODUCT', 'CATEGORY', 'BRAND', 'PAYMENT_METHOD', 'DELIVERY_ZONE');--> statement-breakpoint
CREATE TYPE "public"."promotion_operator_enum" AS ENUM('=', '!=', '>', '<', '>=', '<=', 'IN');--> statement-breakpoint
CREATE TYPE "public"."refund_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reservation_reference_enum" AS ENUM('CART', 'ORDER', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."reservation_status_enum" AS ENUM('active', 'expired', 'released', 'converted');--> statement-breakpoint
CREATE TYPE "public"."shipment_status_enum" AS ENUM('PENDING', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "spatial_ref_sys" (
	"srid" integer PRIMARY KEY NOT NULL,
	"auth_name" varchar(256),
	"auth_srid" integer,
	"srtext" varchar(2048),
	"proj4text" varchar(2048),
	CONSTRAINT "spatial_ref_sys_srid_check" CHECK ((srid > 0) AND (srid <= 998999))
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"session_token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_key" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" "citext" NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(50),
	"is_superuser" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"module" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "permissions_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "store" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"legal_name" varchar(200) NOT NULL,
	"trade_name" varchar(200) NOT NULL,
	"tax_id" varchar(50) NOT NULL,
	"tax_regime" varchar(50) NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"invoice_provider" varchar(50) NOT NULL,
	"invoice_prefix" varchar(10) NOT NULL,
	"supported_languages" jsonb,
	"supported_currencies" jsonb,
	"invoice_resolution" varchar(50),
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"primary_domain" varchar(255) NOT NULL,
	"secondary_domains" jsonb,
	"address" text NOT NULL,
	"logo_media_id" bigint,
	"theme_config" jsonb DEFAULT '{}'::jsonb,
	"currency_code" varchar(3) DEFAULT 'COP' NOT NULL,
	"language" varchar(10) DEFAULT 'es' NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/Bogota' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_tax_id_key" UNIQUE("tax_id")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"store_id" bigint NOT NULL,
	"email" varchar(255) NOT NULL,
	"priority" smallint DEFAULT 1,
	"manager_name" varchar(150) NOT NULL,
	"manager_phone" varchar(30) NOT NULL,
	"max_daily_orders" integer,
	"branch_type" varchar(50) DEFAULT 'STORE',
	"location" "geography" NOT NULL,
	"delivery_radius_km" numeric(6, 2) DEFAULT '5.0' NOT NULL,
	"schedule" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "branches_code_key" UNIQUE("code"),
	CONSTRAINT "branches_delivery_radius_km_check" CHECK (delivery_radius_km > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"delivery_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"display_order" smallint,
	"schedule" jsonb,
	"coverage_area" "geography" NOT NULL,
	"estimated_min_minutes" smallint NOT NULL,
	"estimated_max_minutes" smallint NOT NULL,
	"delivery_type" varchar(30) DEFAULT 'STANDARD' NOT NULL,
	"minimum_order" numeric(12, 2) DEFAULT '0' NOT NULL,
	"estimated_time_minutes" integer DEFAULT 60 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "delivery_zones_minimum_order_check" CHECK (minimum_order >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"status" "media_status_enum" DEFAULT 'active' NOT NULL,
	"media_type" "media_type_enum" NOT NULL,
	"uploaded_by" bigint,
	"provider" varchar(50) DEFAULT 'local' NOT NULL,
	"path" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"checksum" varchar(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"alt_text" varchar(255),
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_checksum_key" UNIQUE("checksum"),
	CONSTRAINT "media_height_check" CHECK ((height IS NULL) OR (height > 0)),
	CONSTRAINT "media_size_bytes_check" CHECK (size_bytes >= 0),
	CONSTRAINT "media_width_check" CHECK ((width IS NULL) OR (width > 0))
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"parent_id" bigint,
	"name" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"image_media_id" bigint,
	"level" integer DEFAULT 0,
	"meta_title" varchar(255),
	"meta_description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "categories_parent_id_name_key" UNIQUE("parent_id","name"),
	CONSTRAINT "categories_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"data_type" varchar(20) NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"module" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"website" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"country" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_media_id" bigint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "brands_name_key" UNIQUE("name"),
	CONSTRAINT "brands_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"brand_id" bigint,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"product_type" varchar(20) DEFAULT 'SIMPLE' NOT NULL,
	"sku_prefix" varchar(50),
	"featured" boolean DEFAULT false NOT NULL,
	"manufacturer" varchar(255),
	"visibility" varchar(20) DEFAULT 'PUBLIC' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "products_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"media_id" bigint NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "attributes_name_key" UNIQUE("name"),
	CONSTRAINT "attributes_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "attribute_options" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"attribute_id" bigint NOT NULL,
	"value" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"attribute_option_id" bigint,
	"custom_value" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(100),
	"current_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"current_compare_price" numeric(12, 2),
	"length_mm" integer,
	"width_mm" integer,
	"height_mm" integer,
	"cost_price" numeric(12, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "product_variants_sku_key" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "variant_attributes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"variant_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"attribute_option_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	"changed_by" bigint NOT NULL,
	"change_reason" varchar(100) NOT NULL,
	"cost" numeric(12, 2),
	"price" numeric(12, 2) NOT NULL,
	"compare_price" numeric(12, 2),
	"version" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prices_check" CHECK ((compare_price IS NULL) OR (compare_price >= price)),
	CONSTRAINT "prices_cost_check" CHECK ((cost IS NULL) OR (cost >= (0)::numeric)),
	CONSTRAINT "prices_date_check" CHECK ((end_date IS NULL) OR (end_date > start_date)),
	CONSTRAINT "prices_price_check" CHECK (price >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(30) NOT NULL,
	"description" text,
	"priority" smallint DEFAULT 1 NOT NULL,
	"compound" boolean DEFAULT false NOT NULL,
	"valid_from" date,
	"country_code" char(2),
	"state_code" varchar(20),
	"city_code" varchar(20),
	"valid_to" date,
	"rate" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"tax_type" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tax_rates_code_key" UNIQUE("code"),
	CONSTRAINT "tax_rates_check" CHECK ((valid_to IS NULL) OR (valid_to >= valid_from)),
	CONSTRAINT "tax_rates_rate_check" CHECK ((rate >= (0)::numeric) AND (rate <= (100)::numeric))
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"branch_id" bigint NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"reserved_stock" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"target_stock" integer,
	"last_movement_at" timestamp with time zone,
	"last_counted_at" timestamp with time zone,
	"minimum_stock" integer DEFAULT 0,
	"maximum_stock" integer DEFAULT 999999,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_check" CHECK (reserved_stock <= stock),
	CONSTRAINT "inventory_check1" CHECK (target_stock >= reorder_point),
	CONSTRAINT "inventory_check2" CHECK (maximum_stock >= minimum_stock),
	CONSTRAINT "inventory_minimum_stock_check" CHECK (minimum_stock >= 0),
	CONSTRAINT "inventory_reorder_point_check" CHECK (reorder_point >= 0),
	CONSTRAINT "inventory_reserved_stock_check" CHECK (reserved_stock >= 0),
	CONSTRAINT "inventory_stock_check" CHECK (stock >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"inventory_id" bigint NOT NULL,
	"reference_type" "reservation_reference_enum" DEFAULT 'CART',
	"reference_id" bigint NOT NULL,
	"created_by" bigint,
	"quantity" integer NOT NULL,
	"released_quantity" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '00:15:00'::interval) NOT NULL,
	"released_at" timestamp with time zone,
	"status" "reservation_status_enum" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_check" CHECK ((released_quantity >= 0) AND (released_quantity <= quantity)),
	CONSTRAINT "inventory_reservations_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"inventory_id" bigint NOT NULL,
	"movement_type" "inventory_movement_type_enum" NOT NULL,
	"quantity" integer NOT NULL,
	"reference_type" "inventory_reference_enum" NOT NULL,
	"performed_by" bigint NOT NULL,
	"previous_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"unit_cost" numeric(12, 2),
	"external_reference" varchar(100),
	"reference_id" bigint,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(30),
	"legal_name" varchar(200) NOT NULL,
	"tax_id" varchar(50),
	"contact_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"website" varchar(255),
	"payment_terms_days" integer,
	"currency_code" char(3),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "suppliers_code_key" UNIQUE("code"),
	CONSTRAINT "suppliers_tax_id_key" UNIQUE("tax_id"),
	CONSTRAINT "suppliers_payment_terms_days_check" CHECK (payment_terms_days >= 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"supplier_id" bigint NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"supplier_sku" varchar(100),
	"purchase_price" numeric(12, 2),
	"lead_time_days" integer DEFAULT 0,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_products_supplier_id_product_variant_id_key" UNIQUE("supplier_id","product_variant_id"),
	CONSTRAINT "supplier_products_lead_time_days_check" CHECK (lead_time_days >= 0),
	CONSTRAINT "supplier_products_purchase_price_check" CHECK (purchase_price >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" "citext" NOT NULL,
	"password_hash" varchar(255),
	"document_number" varchar(50),
	"document_type" varchar(20),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"birth_date" date,
	"gender" varchar(20),
	"customer_type" "customer_type_enum" DEFAULT 'registered' NOT NULL,
	"preferred_language" varchar(10) DEFAULT 'es',
	"accepts_marketing" boolean DEFAULT false NOT NULL,
	"accepts_terms_at" timestamp with time zone,
	"is_verified" boolean DEFAULT false NOT NULL,
	"last_activity_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "customers_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint NOT NULL,
	"alias" varchar(50),
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100) DEFAULT 'Colombia' NOT NULL,
	"delivery_instructions" text,
	"location" "geography",
	"reference" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"label_color" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint NOT NULL,
	"session_token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"ip_address" "inet",
	"revoked_at" timestamp with time zone,
	"device_name" varchar(100),
	"user_agent" text,
	"expires_at" timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_sessions_session_token_key" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "guest_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"converted_customer_id" bigint,
	"session_token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_sessions_session_token_key" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "customer_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint NOT NULL,
	"token" uuid DEFAULT uuid_generate_v4() NOT NULL,
	"purpose" "customer_token_purpose_enum" NOT NULL,
	"consumed_ip" "inet",
	"created_ip" "inet",
	"expires_at" timestamp with time zone DEFAULT (now() + '01:00:00'::interval) NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_tokens_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"coupon_id" bigint,
	"customer_id" bigint,
	"guest_session_id" bigint,
	"branch_id" bigint,
	"delivery_zone_id" bigint,
	"customer_address_id" bigint,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
	"status" "cart_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_owner_check" CHECK (((customer_id IS NOT NULL) AND (guest_session_id IS NULL)) OR ((customer_id IS NULL) AND (guest_session_id IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"cart_id" bigint NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_discount_amount_check" CHECK (discount_amount >= (0)::numeric),
	CONSTRAINT "cart_items_quantity_check" CHECK (quantity > 0),
	CONSTRAINT "cart_items_subtotal_check" CHECK (subtotal >= (0)::numeric),
	CONSTRAINT "cart_items_tax_amount_check" CHECK (tax_amount >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "delivery_time_slots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"branch_id" bigint NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"max_orders" integer DEFAULT 10,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_time_slots_check" CHECK (end_time > start_time),
	CONSTRAINT "delivery_time_slots_day_of_week_check" CHECK ((day_of_week >= 0) AND (day_of_week <= 6))
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reference_code" varchar(20) NOT NULL,
	"customer_id" bigint,
	"guest_session_id" bigint,
	"branch_id" bigint NOT NULL,
	"delivery_zone_id" bigint,
	"customer_address_id" bigint,
	"status" "order_status_enum" DEFAULT 'created' NOT NULL,
	"currency_code" varchar(3) DEFAULT 'COP' NOT NULL,
	"exchange_rate" numeric(12, 6) DEFAULT '1.0',
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_tax" numeric(12, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"customer_ip" "inet",
	"coupon_id" bigint,
	"user_agent" text,
	"notes" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_reference_code_key" UNIQUE("reference_code"),
	CONSTRAINT "orders_discount_total_check" CHECK (discount_total >= (0)::numeric),
	CONSTRAINT "orders_exchange_rate_check" CHECK (exchange_rate > (0)::numeric),
	CONSTRAINT "orders_grand_total_check" CHECK (grand_total >= (0)::numeric),
	CONSTRAINT "orders_shipping_cost_check" CHECK (shipping_cost >= (0)::numeric),
	CONSTRAINT "orders_shipping_tax_check" CHECK (shipping_tax >= (0)::numeric),
	CONSTRAINT "orders_subtotal_check" CHECK (subtotal >= (0)::numeric),
	CONSTRAINT "orders_tax_total_check" CHECK (tax_total >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tax_name" varchar(100),
	"order_id" bigint NOT NULL,
	"product_variant_id" bigint,
	"product_name" varchar(255) NOT NULL,
	"variant_sku" varchar(100),
	"quantity" integer NOT NULL,
	"unit_price_net" numeric(12, 2) NOT NULL,
	"unit_price_gross" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_check" CHECK (unit_price_gross >= unit_price_net),
	CONSTRAINT "order_items_discount_amount_check" CHECK (discount_amount >= (0)::numeric),
	CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0),
	CONSTRAINT "order_items_subtotal_check" CHECK (subtotal >= (0)::numeric),
	CONSTRAINT "order_items_tax_amount_check" CHECK (tax_amount >= (0)::numeric),
	CONSTRAINT "order_items_unit_price_net_check" CHECK (unit_price_net >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" varchar(100) NOT NULL,
	"postal_code" varchar(20),
	"location" "geography",
	"delivery_time_slot_id" bigint,
	"scheduled_date" date,
	"carrier_name" varchar(100),
	"tracking_number" varchar(100),
	"tracking_url" text,
	"carrier_reference" varchar(100),
	"estimated_delivery_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"recipient_name" varchar(200),
	"recipient_phone" varchar(50),
	"shipping_tax_rate_id" bigint,
	"shipping_tax_amount" numeric(12, 2) DEFAULT '0',
	"status" "shipment_status_enum" DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_order_id_key" UNIQUE("order_id"),
	CONSTRAINT "shipments_shipping_tax_amount_check" CHECK (shipping_tax_amount >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "payment_intents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"payment_method" "payment_method_enum" NOT NULL,
	"status" "payment_intent_status_enum" DEFAULT 'created' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'COP' NOT NULL,
	"provider_transaction_id" varchar(255),
	"provider_response" jsonb,
	"idempotency_key" varchar(100),
	"customer_ip" "inet",
	"provider_name" varchar(100),
	"user_agent" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_intents_order_id_key" UNIQUE("order_id"),
	CONSTRAINT "payment_intents_idempotency_key_key" UNIQUE("idempotency_key"),
	CONSTRAINT "payment_intents_amount_check" CHECK (amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"payment_intent_id" bigint,
	"provider_transaction_id" varchar(255) NOT NULL,
	"provider_name" varchar(100),
	"authorization_code" varchar(100),
	"provider_response" jsonb,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'COP' NOT NULL,
	"payment_method" "payment_method_enum" NOT NULL,
	"installments" integer DEFAULT 1,
	"status" "payment_status_enum" DEFAULT 'PENDING',
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_provider_transaction_id_key" UNIQUE("provider_transaction_id"),
	CONSTRAINT "payments_amount_check" CHECK (amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_id" bigint NOT NULL,
	"order_id" bigint NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text,
	"provider_response" jsonb,
	"processed_by" bigint,
	"status" "refund_status_enum" DEFAULT 'pending' NOT NULL,
	"provider_refund_id" varchar(255),
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_amount_check" CHECK (amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"status" "order_status_enum" NOT NULL,
	"note" text,
	"old_status" "order_status_enum",
	"created_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"issued_at" timestamp with time zone,
	"provider_name" varchar(100),
	"provider_invoice_id" varchar(100),
	"xml_media_id" bigint,
	"pdf_media_id" bigint,
	"cufe_code" varchar(100),
	"status" "invoice_status_enum" DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_order_id_key" UNIQUE("order_id"),
	CONSTRAINT "invoices_invoice_number_key" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "delivery_drivers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" "citext",
	"vehicle_type" varchar(50),
	"vehicle_plate" varchar(20),
	"vehicle_brand" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_color" varchar(50),
	"is_available" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_location" "geography",
	"last_location_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "delivery_driver_locations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"driver_id" bigint NOT NULL,
	"location" "geography" NOT NULL,
	"speed_kmh" numeric(5, 2),
	"heading_degrees" integer,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_driver_locations_heading_degrees_check" CHECK ((heading_degrees >= 0) AND (heading_degrees <= 359)),
	CONSTRAINT "delivery_driver_locations_speed_kmh_check" CHECK (speed_kmh >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "delivery_assignments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"shipment_id" bigint NOT NULL,
	"driver_id" bigint NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"estimated_arrival" timestamp with time zone,
	"picked_up_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"status" "delivery_assignment_status_enum" DEFAULT 'ASSIGNED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"assignment_id" bigint NOT NULL,
	"event_type" "delivery_event_type_enum" NOT NULL,
	"location" "geography",
	"description" text,
	"created_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_auto_apply" boolean DEFAULT false NOT NULL,
	"requires_code" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0,
	"stackable" boolean DEFAULT false NOT NULL,
	"exclusive" boolean DEFAULT false NOT NULL,
	"usage_limit" integer,
	"times_used" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "promotion_dates_check" CHECK (end_date > start_date)
);
--> statement-breakpoint
CREATE TABLE "promotion_conditions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"promotion_id" bigint NOT NULL,
	"condition_type" "promotion_condition_type_enum" NOT NULL,
	"operator" "promotion_operator_enum" NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"promotion_id" bigint NOT NULL,
	"code" varchar(50) NOT NULL,
	"max_uses_total" integer DEFAULT 1,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"times_used" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_uses_per_customer" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"discount_amount" numeric(12, 2),
	"ip_address" "inet",
	"guest_session_id" bigint,
	"coupon_id" bigint NOT NULL,
	"customer_id" bigint,
	"order_id" bigint,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_redemptions_discount_amount_check" CHECK (discount_amount >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(100),
	"media_id" bigint NOT NULL,
	"link_url" text,
	"link_target" varchar(20) DEFAULT '_self' NOT NULL,
	"alt_text" varchar(255),
	"description" text,
	"position" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "banner_dates_check" CHECK ((end_date IS NULL) OR (start_date IS NULL) OR (end_date > start_date))
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"meta_keywords" text,
	"published_at" timestamp with time zone,
	"created_by" bigint,
	"updated_by" bigint,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content" text,
	"meta_title" varchar(200),
	"meta_description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pages_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" "menu_location_enum",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menus_location_key" UNIQUE("location")
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"menu_id" bigint NOT NULL,
	"parent_id" bigint,
	"title" varchar(100) NOT NULL,
	"link_url" text NOT NULL,
	"icon" varchar(100),
	"css_class" varchar(100),
	"page_id" bigint,
	"target" varchar(20) DEFAULT '_self',
	"position" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"record_id" bigint NOT NULL,
	"action" "audit_action_enum" NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"performed_by" bigint,
	"request_id" uuid,
	"user_agent" text,
	"changed_fields" jsonb,
	"performed_by_customer" bigint,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" "notification_type_enum" NOT NULL,
	"channel" "notification_channel_enum" DEFAULT 'IN_APP' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"sent_at" timestamp with time zone,
	"is_read" boolean DEFAULT false NOT NULL,
	"target_user_id" bigint,
	"target_customer_id" bigint,
	"link_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	CONSTRAINT "notification_target_check" CHECK (((target_user_id IS NOT NULL) AND (target_customer_id IS NULL)) OR ((target_user_id IS NULL) AND (target_customer_id IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_name" varchar(100) NOT NULL,
	"queue_name" varchar(50) DEFAULT 'default' NOT NULL,
	"correlation_id" uuid,
	"worker_name" varchar(100),
	"last_error_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"payload" jsonb NOT NULL,
	"priority" integer DEFAULT 5,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"status" "background_job_status_enum" DEFAULT 'PENDING' NOT NULL,
	"locked_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"result" jsonb,
	"retry_at" timestamp with time zone,
	"error_message" text,
	"error_stack" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "background_jobs_check" CHECK (attempts <= max_attempts),
	CONSTRAINT "background_jobs_priority_check" CHECK ((priority >= 1) AND (priority <= 10))
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" bigint NOT NULL,
	"permission_id" bigint NOT NULL,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" bigint NOT NULL,
	"role_id" bigint NOT NULL,
	CONSTRAINT "user_roles_pkey" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_branches" (
	"user_id" bigint NOT NULL,
	"branch_id" bigint NOT NULL,
	CONSTRAINT "user_branches_pkey" PRIMARY KEY("user_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "product_categories_pkey" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"customer_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_pkey" PRIMARY KEY("customer_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "product_tax_classes" (
	"priority" smallint DEFAULT 1,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"assigned_by" bigint,
	"product_id" bigint NOT NULL,
	"tax_rate_id" bigint NOT NULL,
	CONSTRAINT "product_tax_classes_pkey" PRIMARY KEY("product_id","tax_rate_id")
);
--> statement-breakpoint
CREATE TABLE "promotion_products" (
	"promotion_id" bigint NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"is_percentage" boolean DEFAULT true NOT NULL,
	"maximum_discount" numeric(12, 2),
	CONSTRAINT "promotion_products_pkey" PRIMARY KEY("promotion_id","product_variant_id"),
	CONSTRAINT "promotion_discount_check" CHECK (((is_percentage = true) AND (discount_value <= (100)::numeric)) OR (is_percentage = false)),
	CONSTRAINT "promotion_products_discount_value_check" CHECK (discount_value >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "fk_store_logo_media" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_options" ADD CONSTRAINT "attribute_options_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_option_id_fkey" FOREIGN KEY ("attribute_option_id") REFERENCES "public"."attribute_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_option_id_fkey" FOREIGN KEY ("attribute_option_id") REFERENCES "public"."attribute_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD CONSTRAINT "guest_sessions_converted_customer_id_fkey" FOREIGN KEY ("converted_customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tokens" ADD CONSTRAINT "customer_tokens_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_address_id_fkey" FOREIGN KEY ("customer_address_id") REFERENCES "public"."customer_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_delivery_zone_id_fkey" FOREIGN KEY ("delivery_zone_id") REFERENCES "public"."delivery_zones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_guest_session_id_fkey" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "fk_carts_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_time_slots" ADD CONSTRAINT "delivery_time_slots_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "fk_order_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_address_id_fkey" FOREIGN KEY ("customer_address_id") REFERENCES "public"."customer_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_zone_id_fkey" FOREIGN KEY ("delivery_zone_id") REFERENCES "public"."delivery_zones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_guest_session_id_fkey" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_delivery_time_slot_id_fkey" FOREIGN KEY ("delivery_time_slot_id") REFERENCES "public"."delivery_time_slots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_tax_rate_id_fkey" FOREIGN KEY ("shipping_tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_pdf_media_id_fkey" FOREIGN KEY ("pdf_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_xml_media_id_fkey" FOREIGN KEY ("xml_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_driver_locations" ADD CONSTRAINT "delivery_driver_locations_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."delivery_drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."delivery_drivers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."delivery_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_conditions" ADD CONSTRAINT "promotion_conditions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_guest_session_id_fkey" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_customer_fkey" FOREIGN KEY ("performed_by_customer") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_target_customer_id_fkey" FOREIGN KEY ("target_customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_branches" ADD CONSTRAINT "fk_user_branch_id" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tax_classes" ADD CONSTRAINT "product_tax_classes_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tax_classes" ADD CONSTRAINT "product_tax_classes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tax_classes" ADD CONSTRAINT "product_tax_classes_tax_rate_id_fkey" FOREIGN KEY ("tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" citext_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_permissions_module" ON "permissions" USING btree ("module" text_ops);--> statement-breakpoint
CREATE INDEX "idx_branches_location" ON "branches" USING gist ("location" gist_geography_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_zones_coverage" ON "delivery_zones" USING gist ("coverage_area" gist_geography_ops);--> statement-breakpoint
CREATE INDEX "idx_media_media_type" ON "media" USING btree ("media_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_media_mime_type" ON "media" USING btree ("mime_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_provider" ON "media" USING btree ("provider" text_ops);--> statement-breakpoint
CREATE INDEX "idx_media_status" ON "media" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_media_uploaded_by" ON "media" USING btree ("uploaded_by" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_categories_parent_id" ON "categories" USING btree ("parent_id" int8_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_slug" ON "categories" USING btree ("slug" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_brands_slug" ON "brands" USING btree ("slug" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_products_brand" ON "products" USING btree ("brand_id" int8_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_products_search" ON "products" USING gin (to_tsvector('spanish'::regconfig, (((name)::text || ' '::text)  tsvector_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_slug" ON "products" USING btree ("slug" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_images_unique_cover" ON "product_images" USING btree ("product_id" int8_ops) WHERE (is_cover = true);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attribute_options_unique" ON "attribute_options" USING btree ("attribute_id" int8_ops,"value" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variants_barcode" ON "product_variants" USING btree ("barcode" text_ops) WHERE (barcode IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_product_variants_current_price" ON "product_variants" USING btree ("current_price" numeric_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variants_sku" ON "product_variants" USING btree ("sku" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_variant_attributes_unique" ON "variant_attributes" USING btree ("variant_id" int8_ops,"attribute_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_prices_active_unique" ON "prices" USING btree ("product_variant_id" int8_ops) WHERE (end_date IS NULL);--> statement-breakpoint
CREATE INDEX "idx_tax_rates_active" ON "tax_rates" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_tax_rates_code" ON "tax_rates" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tax_rates_validity" ON "tax_rates" USING btree ("valid_from" date_ops,"valid_to" date_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_branch" ON "inventory" USING btree ("branch_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_branch_stock" ON "inventory" USING btree ("branch_id" int4_ops,"stock" int8_ops) WHERE (stock > 0);--> statement-breakpoint
CREATE INDEX "idx_inventory_reorder" ON "inventory" USING btree ("reorder_point" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reserved" ON "inventory" USING btree ("branch_id" int8_ops,"product_variant_id" int8_ops) WHERE (reserved_stock > 0);--> statement-breakpoint
CREATE INDEX "idx_inventory_stock" ON "inventory" USING btree ("stock" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_inventory_unique" ON "inventory" USING btree ("product_variant_id" int8_ops,"branch_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reservation_expiration" ON "inventory_reservations" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reservation_inventory" ON "inventory_reservations" USING btree ("inventory_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reservation_reference" ON "inventory_reservations" USING btree ("reference_type" int8_ops,"reference_id" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reservation_status" ON "inventory_reservations" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_reservations_cleanup" ON "inventory_reservations" USING btree ("status" enum_ops,"expires_at" timestamptz_ops) WHERE (status = 'active'::reservation_status_enum);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_created" ON "inventory_movements" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_inventory" ON "inventory_movements" USING btree ("inventory_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_reference" ON "inventory_movements" USING btree ("reference_type" int8_ops,"reference_id" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_type" ON "inventory_movements" USING btree ("movement_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_suppliers_active" ON "suppliers" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_supplier_products_preferred" ON "supplier_products" USING btree ("is_preferred" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_supplier_products_supplier" ON "supplier_products" USING btree ("supplier_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_supplier_products_variant" ON "supplier_products" USING btree ("product_variant_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_customers_active" ON "customers" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_customers_last_activity" ON "customers" USING btree ("last_activity_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_addresses_default" ON "customer_addresses" USING btree ("customer_id" int8_ops,"is_default" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_addresses_location" ON "customer_addresses" USING gist ("location" gist_geography_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_customer_default_address" ON "customer_addresses" USING btree ("customer_id" int8_ops) WHERE (is_default = true);--> statement-breakpoint
CREATE INDEX "idx_customer_sessions_customer" ON "customer_sessions" USING btree ("customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_sessions_expiration" ON "customer_sessions" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_guest_sessions_expiration" ON "guest_sessions" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_guest_sessions_last_activity" ON "guest_sessions" USING btree ("last_activity_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_tokens_customer" ON "customer_tokens" USING btree ("customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_tokens_expiration" ON "customer_tokens" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_tokens_purpose" ON "customer_tokens" USING btree ("purpose" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_customer" ON "carts" USING btree ("customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_guest" ON "carts" USING btree ("guest_session_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_last_activity" ON "carts" USING btree ("last_activity_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_carts_status" ON "carts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_active_customer_cart" ON "carts" USING btree ("customer_id" int8_ops) WHERE (status = 'ACTIVE'::cart_status_enum);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_active_guest_cart" ON "carts" USING btree ("guest_session_id" int8_ops) WHERE (status = 'ACTIVE'::cart_status_enum);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_item_unique" ON "cart_items" USING btree ("cart_id" int8_ops,"product_variant_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_cart_items_cart" ON "cart_items" USING btree ("cart_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_cart_items_variant" ON "cart_items" USING btree ("product_variant_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_slot_branch" ON "delivery_time_slots" USING btree ("branch_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_branch" ON "orders" USING btree ("branch_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_customer" ON "orders" USING btree ("customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_customer_status" ON "orders" USING btree ("customer_id" int8_ops,"status" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_reference_code" ON "orders" USING btree ("reference_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status_created" ON "orders" USING btree ("status" enum_ops,"created_at" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_shipments_location" ON "shipments" USING gist ("location" gist_geography_ops);--> statement-breakpoint
CREATE INDEX "idx_payment_intents_gateway" ON "payment_intents" USING btree ("provider_transaction_id" text_ops) WHERE (provider_transaction_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_payment_intents_order_status" ON "payment_intents" USING btree ("order_id" int8_ops,"status" int8_ops) WHERE (status = ANY (ARRAY['pending'::payment_intent_status_enum, 'created'::payment_intent_status_enum]));--> statement-breakpoint
CREATE INDEX "idx_payment_intents_status" ON "payment_intents" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_order" ON "payments" USING btree ("order_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_payment_intent" ON "payments" USING btree ("payment_intent_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_refunds_payment" ON "refunds" USING btree ("payment_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order" ON "order_status_history" USING btree ("order_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_drivers_active" ON "delivery_drivers" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_drivers_available" ON "delivery_drivers" USING btree ("is_available" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_driver_locations_location" ON "delivery_driver_locations" USING gist ("location" gist_geography_ops);--> statement-breakpoint
CREATE INDEX "idx_driver_locations_driver" ON "delivery_driver_locations" USING btree ("driver_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_driver_locations_latest" ON "delivery_driver_locations" USING btree ("driver_id" int8_ops,"recorded_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_driver_locations_recorded" ON "delivery_driver_locations" USING btree ("recorded_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_assignment_driver" ON "delivery_assignments" USING btree ("driver_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_delivery_assignment_order" ON "delivery_assignments" USING btree ("shipment_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_assignment_status" ON "delivery_assignments" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_driver_active_assignment" ON "delivery_assignments" USING btree ("driver_id" int8_ops) WHERE (status = ANY (ARRAY['ASSIGNED'::delivery_assignment_status_enum, 'PICKED_UP'::delivery_assignment_status_enum, 'IN_TRANSIT'::delivery_assignment_status_enum]));--> statement-breakpoint
CREATE INDEX "idx_delivery_events_assignment" ON "delivery_events" USING btree ("assignment_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_events_created" ON "delivery_events" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_delivery_events_type" ON "delivery_events" USING btree ("event_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_promotions_active" ON "promotions" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_promotions_dates" ON "promotions" USING btree ("start_date" timestamptz_ops,"end_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_promotions_priority" ON "promotions" USING btree ("priority" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_promotion_conditions_promotion" ON "promotion_conditions" USING btree ("promotion_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_coupon_active" ON "coupons" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_coupon_code" ON "coupons" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_coupon_redemption_coupon" ON "coupon_redemptions" USING btree ("coupon_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_coupon_redemption_customer" ON "coupon_redemptions" USING btree ("customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_coupon_redemption_order" ON "coupon_redemptions" USING btree ("order_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_banners_active" ON "banners" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_banners_dates" ON "banners" USING btree ("start_date" timestamptz_ops,"end_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_banners_position" ON "banners" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_pages_active" ON "pages" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_pages_slug" ON "pages" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_menu_items_menu" ON "menu_items" USING btree ("menu_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_menu_items_parent" ON "menu_items" USING btree ("parent_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_menu_items_position" ON "menu_items" USING btree ("menu_id" int4_ops,"position" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_record" ON "audit_logs" USING btree ("table_name" int8_ops,"record_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_table" ON "audit_logs" USING btree ("table_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user" ON "audit_logs" USING btree ("performed_by" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_customer" ON "notifications" USING btree ("target_customer_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_customer_unread" ON "notifications" USING btree ("target_customer_id" bool_ops,"is_read" bool_ops) WHERE (is_read = false);--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("target_user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_background_jobs_priority" ON "background_jobs" USING btree ("priority" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_background_jobs_queue" ON "background_jobs" USING btree ("queue_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_background_jobs_schedule" ON "background_jobs" USING btree ("scheduled_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_background_jobs_status" ON "background_jobs" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_role_permissions_role" ON "role_permissions" USING btree ("role_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_user_roles_role" ON "user_roles" USING btree ("role_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_user_roles_user" ON "user_roles" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_product_categories_category" ON "product_categories" USING btree ("category_id" int8_ops);--> statement-breakpoint
CREATE VIEW "public"."geography_columns" AS (SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text));--> statement-breakpoint
CREATE VIEW "public"."geometry_columns" AS (SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ''''::text, 2), ')'::text, ''::text) AS type FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%geometrytype(% = %'::text) st ON st.connamespace = n.oid AND st.conrelid = c.oid AND (a.attnum = ANY (st.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text)::integer AS ndims FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%ndims(% = %'::text) sn ON sn.connamespace = n.oid AND sn.conrelid = c.oid AND (a.attnum = ANY (sn.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text), '('::text, ''::text)::integer AS srid FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%srid(% = %'::text) sr ON sr.connamespace = n.oid AND sr.conrelid = c.oid AND (a.attnum = ANY (sr.conkey)) WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text));
*/