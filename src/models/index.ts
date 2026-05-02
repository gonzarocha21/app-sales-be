export const USER_ROLES = ["admin", "seller"] as const;
export const LOCATION_TYPES = ["warehouse", "store"] as const;
export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export const MOVEMENT_TYPES = ["entry", "transfer", "sale", "return", "removal", "manual_adjustment"] as const;
export const REMOVAL_REASONS = ["expired", "broken", "lost", "internal_consumption", "loading_error", "other"] as const;
export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "other"] as const;
export const LANGUAGES = ["en", "es"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type LocationType = (typeof LOCATION_TYPES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type MovementType = (typeof MOVEMENT_TYPES)[number];
export type StockMovementType = MovementType;
export type RemovalReason = (typeof REMOVAL_REASONS)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type SaleStatus = "registered" | "returned" | "cancelled";
export type Language = (typeof LANGUAGES)[number];

export interface AppSettings {
  lowStockThreshold: number;
  language: Language;
}

export interface Product {
  id: string;
  name: string;
  internalCode: string;
  barcode: string;
  category: string;
  salePrice: number;
  cost: number;
  description: string;
  imageUrl: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  active: boolean;
}

export interface StockLot {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  expirationDate?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;
  type: MovementType;
  removalReason?: RemovalReason;
  createdAt: string;
}

export interface Sale {
  id: string;
  externalReference?: string;
  locationId: string;
  items: SaleItem[];
  status: SaleStatus;
  paymentMethod?: PaymentMethod;
  total: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
