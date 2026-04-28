import { randomUUID } from "crypto";
import { PRODUCT_STATUSES, Product } from "../../models";
import { AppError } from "../../utils/AppError";

const products: Product[] = [
  {
    id: "product-1",
    name: "Sample Product",
    sku: "SKU-001",
    categoryId: "category-1",
    price: 100,
    status: "active"
  }
];

type CreateProductPayload = Pick<Product, "name" | "sku" | "price"> & Partial<Pick<Product, "categoryId" | "status">>;
type UpdateProductPayload = Partial<Omit<Product, "id">>;

const findActiveProduct = (id: string) => {
  const product = products.find((item) => item.id === id && item.status === "active");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const validateCreatePayload = (payload: Partial<CreateProductPayload>) => {
  if (!payload.name || !payload.sku || payload.price === undefined) {
    throw new AppError("Product name, sku and price are required", 400);
  }

  if (typeof payload.price !== "number" || payload.price < 0) {
    throw new AppError("Product price must be a positive number", 400);
  }

  if (payload.status && !PRODUCT_STATUSES.includes(payload.status)) {
    throw new AppError("Product status must be active or inactive", 400);
  }
};

export const productsService = {
  list: () => products.filter((product) => product.status === "active"),

  create: (payload: Partial<CreateProductPayload>): Product => {
    validateCreatePayload(payload);
    const validPayload = payload as CreateProductPayload;

    const product: Product = {
      id: randomUUID(),
      name: validPayload.name,
      sku: validPayload.sku,
      categoryId: validPayload.categoryId,
      price: validPayload.price,
      status: validPayload.status ?? "active"
    };

    products.push(product);

    return product;
  },

  getById: (id: string): Product => findActiveProduct(id),

  update: (id: string, payload: UpdateProductPayload): Product => {
    const product = findActiveProduct(id);

    if (payload.price !== undefined && (typeof payload.price !== "number" || payload.price < 0)) {
      throw new AppError("Product price must be a positive number", 400);
    }

    if (payload.status && !PRODUCT_STATUSES.includes(payload.status)) {
      throw new AppError("Product status must be active or inactive", 400);
    }

    Object.assign(product, payload, { id });

    return product;
  },

  remove: (id: string): Product => {
    const product = findActiveProduct(id);

    product.status = "inactive";

    return product;
  }
};
