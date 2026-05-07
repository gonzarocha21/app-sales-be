import { USER_ROLES, User, UserRole } from "../../models";
import { AppError } from "../../utils/AppError";

const mockUsers: User[] = [
  {
    id: "user-admin",
    name: "Gonzalo Rocha",
    email: "gonzalo@alem.com",
    avatarUrl: "/uploads/branding/profile.jpg",
    role: "admin",
    active: true
  },
  {
    id: "user-seller",
    name: "Martina López",
    email: "martina@alem.com",
    avatarUrl: "https://i.pravatar.cc/150?u=martina",
    role: "seller",
    active: true
  }
];

const validateRole = (role: unknown) => {
  if (role && !USER_ROLES.includes(role as UserRole)) {
    throw new AppError("User role must be admin or seller", 400);
  }
};

export const usersService = {
  list: () => mockUsers,
  create: (payload: Partial<User>): User => {
    validateRole(payload.role);

    return {
      id: "user-new",
      name: payload.name ?? "New User",
      email: payload.email ?? "user@example.com",
      role: payload.role ?? "seller",
      active: payload.active ?? true
    };
  },
  getById: (id: string): User => ({
    ...mockUsers[0],
    id
  }),
  update: (id: string, payload: Partial<User>): User => {
    validateRole(payload.role);

    return {
      ...mockUsers[0],
      ...payload,
      id
    };
  },
  remove: (id: string) => ({ id })
};
