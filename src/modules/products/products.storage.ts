import { Product } from "../../models";

const seededAt = "2026-04-28T00:00:00.000Z";

const products: Product[] = [
  {
    id: "product-1",
    name: "Bombilla Alpaca boca ancha",
    internalCode: "ALEM-BOM-001",
    barcode: "779000100001",
    category: "Bombillas",
    salePrice: 790,
    cost: 430,
    description: "Bombilla de alpaca con caño fino y boca ancha.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-2",
    name: "Mate Camionero",
    internalCode: "ALEM-MAT-001",
    barcode: "779000100002",
    category: "Calabaza",
    salePrice: 890,
    cost: 490,
    description: "Mate camionero de calabaza trabajado artesanalmente.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-3",
    name: "Matera de Auto Cuero con manija mod0024",
    internalCode: "ALEM-MTE-001",
    barcode: "779000100003",
    category: "Materas",
    salePrice: 1890,
    cost: 1040,
    description: "Matera de auto en cuero con manija.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-4",
    name: "Mate Imperial Cerámica",
    internalCode: "ALEM-MAT-002",
    barcode: "779000100004",
    category: "Ceramica",
    salePrice: 2750,
    cost: 1510,
    description: "Mate imperial de cerámica.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-5",
    name: "Mate Pulido",
    internalCode: "ALEM-MAT-003",
    barcode: "779000100005",
    category: "Calabaza",
    salePrice: 650,
    cost: 360,
    description: "Mate de calabaza pulido.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-6",
    name: "Mate Cerámica",
    internalCode: "ALEM-MAT-004",
    barcode: "779000100006",
    category: "Ceramica",
    salePrice: 690,
    cost: 380,
    description: "Mate de cerámica para uso diario.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-7",
    name: "Mate Imperial calabaza cincelado",
    internalCode: "ALEM-MAT-005",
    barcode: "779000100007",
    category: "Calabaza",
    salePrice: 2850,
    cost: 1570,
    description: "Mate imperial de calabaza cincelado.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-8",
    name: "Mate Alpaca y Oro",
    internalCode: "ALEM-MAT-006",
    barcode: "779000100008",
    category: "Calabaza",
    salePrice: 3490,
    cost: 1920,
    description: "Mate con terminaciones en alpaca y oro.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-9",
    name: "Bombilla Alpaca y Oro",
    internalCode: "ALEM-BOM-002",
    barcode: "779000100009",
    category: "Bombillas",
    salePrice: 1690,
    cost: 930,
    description: "Bombilla de alpaca y oro elaborada artesanalmente.",
    imageUrl: "",
    status: "active",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "product-10",
    name: "Bombilla Plata Lisa",
    internalCode: "ALEM-BOM-003",
    barcode: "779000100010",
    category: "Bombillas",
    salePrice: 6290,
    cost: 3460,
    description: "Bombilla de plata lisa.",
    imageUrl: "",
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
