import { randomUUID } from "crypto";
import { PRODUCT_STATUSES, Product, ProductStatus } from "../../models";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { locationsService } from "../locations/locations.service";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { productsStorage } from "./products.storage";

type CreateProductPayload = Omit<Product, "id" | "status" | "createdAt" | "updatedAt">;
type UpdateProductPayload = Omit<Product, "id" | "createdAt" | "updatedAt">;
type ProductListFilters = {
  search?: string;
  category?: string;
  locationId?: string;
  status?: ProductStatus;
  lowStock?: string;
  sortBy?: string;
  sortOrder?: string;
};
type ProductListItem = {
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
  totalStock: number;
  stockByLocation: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
};
type ProductDetail = ProductListItem & {
  stockLots: Array<{
    id: string;
    locationId: string;
    locationName: string;
    quantity: number;
    expirationDate: string | null;
  }>;
};

const findProduct = (id: string) => {
  const product = productsStorage.findById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const findActiveProduct = (id: string) => {
  const product = findProduct(id);

  if (product.status !== "active") {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const validateCreatePayload = (payload: Partial<CreateProductPayload>) => {
  const requiredStringFields: Array<keyof Pick<
    CreateProductPayload,
    "name" | "internalCode" | "barcode" | "category" | "description"
  >> = ["name", "internalCode", "barcode", "category", "description"];
  const missingStringField = requiredStringFields.find(
    (field) => typeof payload[field] !== "string" || !payload[field].trim()
  );

  if (missingStringField || payload.salePrice === undefined || payload.cost === undefined) {
    throw new AppError("Product name, internalCode, barcode, category, salePrice, cost and description are required", 400);
  }

  if (typeof payload.salePrice !== "number" || payload.salePrice < 0) {
    throw new AppError("Product salePrice must be a number greater than or equal to 0", 400);
  }

  if (typeof payload.cost !== "number" || payload.cost < 0) {
    throw new AppError("Product cost must be a number greater than or equal to 0", 400);
  }
};

const validateUpdatePayload = (payload: Partial<UpdateProductPayload>) => {
  const requiredStringFields: Array<keyof Pick<
    UpdateProductPayload,
    "name" | "internalCode" | "barcode" | "category" | "description"
  >> = ["name", "internalCode", "barcode", "category", "description"];
  const missingStringField = requiredStringFields.find(
    (field) => typeof payload[field] !== "string" || !payload[field].trim()
  );

  if (missingStringField || payload.salePrice === undefined || payload.cost === undefined || !payload.status) {
    throw new AppError("Product name, internalCode, barcode, category, salePrice, cost, description and status are required", 400);
  }

  if (typeof payload.salePrice !== "number" || payload.salePrice < 0) {
    throw new AppError("Product salePrice must be a number greater than or equal to 0", 400);
  }

  if (typeof payload.cost !== "number" || payload.cost < 0) {
    throw new AppError("Product cost must be a number greater than or equal to 0", 400);
  }

  if (payload.status && !PRODUCT_STATUSES.includes(payload.status)) {
    throw new AppError("Product status must be active or inactive", 400);
  }
};

const getBooleanFilter = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new AppError("lowStock must be true or false", 400);
};

const getSortOrder = (sortOrder: string | undefined) => {
  if (!sortOrder) {
    return "asc";
  }

  if (sortOrder !== "asc" && sortOrder !== "desc") {
    throw new AppError("sortOrder must be asc or desc", 400);
  }

  return sortOrder;
};

const compareValues = (firstValue: string | number, secondValue: string | number) => {
  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }

  return String(firstValue).localeCompare(String(secondValue));
};

const buildProductListItem = (product: Product): ProductListItem => {
  const locations = locationsService.list();
  const stockLots = stockLotsService.list().filter((lot) => lot.productId === product.id);
  const quantitiesByLocation = stockLots.reduce<Record<string, number>>((summary, lot) => {
    summary[lot.locationId] = (summary[lot.locationId] ?? 0) + lot.quantity;
    return summary;
  }, {});
  const stockByLocation = Object.entries(quantitiesByLocation).map(([locationId, quantity]) => ({
    locationId,
    locationName: locations.find((location) => location.id === locationId)?.name ?? "Unknown location",
    quantity
  }));

  return {
    id: product.id,
    name: product.name,
    internalCode: product.internalCode,
    barcode: product.barcode,
    category: product.category,
    salePrice: product.salePrice,
    cost: product.cost,
    description: product.description,
    imageUrl: product.imageUrl,
    status: product.status,
    totalStock: stockByLocation.reduce((total, item) => total + item.quantity, 0),
    stockByLocation,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

const buildProductDetail = (product: Product): ProductDetail => {
  const listItem = buildProductListItem(product);
  const locations = locationsService.list();
  const stockLots = stockLotsService
    .list()
    .filter((lot) => lot.productId === product.id)
    .map((lot) => ({
      id: lot.id,
      locationId: lot.locationId,
      locationName: locations.find((location) => location.id === lot.locationId)?.name ?? "Unknown location",
      quantity: lot.quantity,
      expirationDate: lot.expirationDate ?? null
    }));

  return {
    ...listItem,
    stockLots
  };
};

export const productsService = {
  list: (filters: ProductListFilters = {}) => {
    const search = filters.search?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const lowStock = getBooleanFilter(filters.lowStock);
    const sortOrder = getSortOrder(filters.sortOrder);

    if (filters.status && !PRODUCT_STATUSES.includes(filters.status)) {
      throw new AppError("Product status must be active or inactive", 400);
    }

    const filteredProducts = productsStorage.findAll().filter((product) => {
      const item = buildProductListItem(product);
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.id.toLowerCase().includes(search) ||
        product.barcode.toLowerCase().includes(search) ||
        product.internalCode.toLowerCase().includes(search);
      const matchesCategory = !category || product.category.toLowerCase() === category;
      const matchesLocation =
        !filters.locationId || item.stockByLocation.some((stockItem) => stockItem.locationId === filters.locationId);
      const matchesStatus = !filters.status || product.status === filters.status;
      const matchesLowStock = lowStock === undefined || (item.totalStock <= env.lowStockThreshold) === lowStock;

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesLowStock;
    });
    const listItems = filteredProducts.map(buildProductListItem);

    const sortBy = (filters.sortBy ?? "name") as keyof ProductListItem;
    const sortableFields: Array<keyof ProductListItem> = [
      "name",
      "category",
      "totalStock",
      "salePrice",
      "cost",
      "createdAt"
    ];

    if (!sortableFields.includes(sortBy)) {
      throw new AppError("sortBy must be name, category, totalStock, salePrice, cost or createdAt", 400);
    }

    listItems.sort((firstItem, secondItem) => {
      const comparison = compareValues(
        firstItem[sortBy] as string | number,
        secondItem[sortBy] as string | number
      );

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return listItems;
  },

  create: (payload: Partial<CreateProductPayload>): Product => {
    validateCreatePayload(payload);
    const validPayload = payload as CreateProductPayload;
    const now = new Date().toISOString();

    const product: Product = {
      id: randomUUID(),
      name: validPayload.name,
      internalCode: validPayload.internalCode,
      barcode: validPayload.barcode,
      category: validPayload.category,
      salePrice: validPayload.salePrice,
      cost: validPayload.cost,
      description: validPayload.description,
      imageUrl: validPayload.imageUrl ?? "",
      status: "active",
      createdAt: now,
      updatedAt: now
    };

    return productsStorage.create(product);
  },

  getById: (id: string): ProductDetail => buildProductDetail(findProduct(id)),

  update: (id: string, payload: Partial<UpdateProductPayload>): Product => {
    const product = findProduct(id);
    validateUpdatePayload(payload);
    const validPayload = payload as UpdateProductPayload;
    const updatedProduct = productsStorage.update(id, {
      name: validPayload.name,
      internalCode: validPayload.internalCode,
      barcode: validPayload.barcode,
      category: validPayload.category,
      salePrice: validPayload.salePrice,
      cost: validPayload.cost,
      description: validPayload.description,
      imageUrl: validPayload.imageUrl ?? "",
      status: validPayload.status,
      updatedAt: new Date().toISOString()
    });

    return updatedProduct ?? product;
  },

  remove: (id: string): Product => {
    const product = findProduct(id);

    return productsStorage.update(id, {
      status: "inactive",
      updatedAt: new Date().toISOString()
    }) ?? product;
  }
};
