import { Product } from "../../models";

const seededAt = "2026-04-28T00:00:00.000Z";

const products: Product[] = [
  {
    id: "product-1",
    name: "Remera Básica Blanca",
    internalCode: "REM-BLA-001",
    barcode: "779000000001",
    category: "Indumentaria",
    salePrice: 100,
    cost: 60,
    description: "Remera básica de algodón color blanco.",
    imageUrl: "https://example.com/remera-basica-blanca.jpg",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-2",
    name: "Jean Azul",
    internalCode: "JEA-AZU-001",
    barcode: "779000000002",
    category: "Indumentaria",
    salePrice: 180,
    cost: 95,
    description: "Jean azul clásico.",
    imageUrl: "https://example.com/jean-azul.jpg",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-3",
    name: "Botella Térmica",
    internalCode: "BOT-TER-001",
    barcode: "779000000003",
    category: "Accesorios",
    salePrice: 75,
    cost: 38,
    description: "Botella térmica reutilizable.",
    imageUrl: "https://example.com/botella-termica.jpg",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  }
];

export const productsStorage = {
  findAll: () => products,

  findById: (id: string) => products.find((product) => product.id === id),

  create: (product: Product) => {
    products.push(product);
    return product;
  },

  update: (id: string, payload: Partial<Product>) => {
    const product = products.find((item) => item.id === id);

    if (!product) {
      return null;
    }

    Object.assign(product, payload, { id });

    return product;
  }
};
