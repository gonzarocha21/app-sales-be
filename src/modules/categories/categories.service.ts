import { MockCategory, mockCategories } from "../../mocks/categories.mock";

type Category = MockCategory;

export const categoriesService = {
  list: () => mockCategories,
  create: (payload: Partial<Category>): Category => ({
    id: "category-new",
    name: payload.name ?? "New Category",
    active: payload.active ?? true
  }),
  getById: (id: string): Category => ({
    ...mockCategories[0],
    id
  }),
  update: (id: string, payload: Partial<Category>): Category => ({
    ...mockCategories[0],
    ...payload,
    id
  }),
  remove: (id: string) => ({ id })
};
