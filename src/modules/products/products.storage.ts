import { Product } from "../../models";
import { mockProducts } from "../../mocks/products.mock";

export const productsStorage = {
  findAll: () => mockProducts,

  findById: (id: string) => mockProducts.find((product) => product.id === id),

  create: (product: Product) => {
    mockProducts.push(product);
    return product;
  },

  update: (id: string, payload: Partial<Product>) => {
    const product = mockProducts.find((item) => item.id === id);

    if (!product) {
      return null;
    }

    Object.assign(product, payload, { id });

    return product;
  }
};
