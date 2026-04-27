import { User } from "../../types/domain";

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    active: true
  }
];

export const usersService = {
  list: () => mockUsers,
  create: (payload: Partial<User>): User => ({
    id: "user-new",
    name: payload.name ?? "New User",
    email: payload.email ?? "user@example.com",
    role: payload.role ?? "operator",
    active: payload.active ?? true
  }),
  getById: (id: string): User => ({
    ...mockUsers[0],
    id
  }),
  update: (id: string, payload: Partial<User>): User => ({
    ...mockUsers[0],
    ...payload,
    id
  }),
  remove: (id: string) => ({ id })
};
