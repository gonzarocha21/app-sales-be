import { USER_ROLES, User, UserRole } from "../../models";
import { mockUsers } from "../../mocks/users.mock";
import { AppError } from "../../utils/AppError";

type CreateUserPayload = Partial<User> & Pick<User, "email" | "password">;

const validateRole = (role: unknown) => {
  if (role && !USER_ROLES.includes(role as UserRole)) {
    throw new AppError("User role must be admin or seller", 400);
  }
};

const validateCreatePayload = (payload: Partial<User>) => {
  if (!payload.email) {
    throw new AppError("User email is required", 400);
  }

  if (!payload.password) {
    throw new AppError("User password is required", 400);
  }

  validateRole(payload.role);
};

export const usersService = {
  list: () => mockUsers,
  create: (payload: Partial<User>): User => {
    validateCreatePayload(payload);
    const validPayload = payload as CreateUserPayload;
    const now = new Date().toISOString();

    return {
      id: "user-new",
      name: validPayload.name,
      email: validPayload.email,
      phone: validPayload.phone,
      profileImageUrl: validPayload.profileImageUrl,
      password: validPayload.password,
      role: payload.role ?? "seller",
      associatedLocationId: validPayload.associatedLocationId,
      active: validPayload.active ?? true,
      createdAt: now,
      updatedAt: now
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
