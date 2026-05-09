import { randomUUID } from "crypto";
import { User } from "../../models";
import { mockAuthUsers } from "../../mocks/authUsers.mock";
import { mockUsers } from "../../mocks/users.mock";
import { AppError } from "../../utils/AppError";
import { locationsService } from "../locations/locations.service";

type CreateEmployeePayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  profileImageUrl?: unknown;
  password?: unknown;
  associatedLocationId?: unknown;
};
type UpdateEmployeePayload = CreateEmployeePayload & {
  active?: unknown;
};

export type EmployeeResponse = Omit<User, "password">;
export type EmployeeListResponse = EmployeeResponse & {
  associatedLocationName?: string;
};
export type DeactivateEmployeeResponse = Pick<User, "id" | "active">;

type ListEmployeesQuery = {
  search?: unknown;
  active?: unknown;
  locationId?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeOptionalString = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError("Optional employee fields must be strings", 400, "VALIDATION_ERROR");
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
};

const validateLocationId = (associatedLocationId: unknown) => {
  if (associatedLocationId !== undefined) {
    if (typeof associatedLocationId !== "string" || !associatedLocationId.trim()) {
      throw new AppError("associatedLocationId must be a valid location", 400, "LOCATION_NOT_FOUND");
    }

    const locationExists = locationsService
      .list()
      .some((location) => location.id === associatedLocationId && location.active);

    if (!locationExists) {
      throw new AppError("associatedLocationId must be a valid location", 400, "LOCATION_NOT_FOUND");
    }
  }
};

const validateCreatePayload = (payload: CreateEmployeePayload) => {
  if (typeof payload.email !== "string" || !payload.email.trim()) {
    throw new AppError("email is required", 400, "VALIDATION_ERROR");
  }

  if (!emailPattern.test(payload.email.trim())) {
    throw new AppError("email must have a valid format", 400, "INVALID_EMAIL");
  }

  if (typeof payload.password !== "string" || !payload.password.trim()) {
    throw new AppError("password is required", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const emailAlreadyExists = mockUsers.some((user) => user.email.trim().toLowerCase() === normalizedEmail);

  if (emailAlreadyExists) {
    throw new AppError("email already exists", 400, "EMAIL_ALREADY_EXISTS");
  }

  validateLocationId(payload.associatedLocationId);
};

const validateUpdatePayload = (id: string, payload: UpdateEmployeePayload) => {
  if (typeof payload.email !== "string" || !payload.email.trim()) {
    throw new AppError("email is required", 400, "VALIDATION_ERROR");
  }

  if (!emailPattern.test(payload.email.trim())) {
    throw new AppError("email must have a valid format", 400, "INVALID_EMAIL");
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const emailAlreadyExists = mockUsers.some(
    (user) => user.id !== id && user.email.trim().toLowerCase() === normalizedEmail
  );

  if (emailAlreadyExists) {
    throw new AppError("email already exists", 400, "EMAIL_ALREADY_EXISTS");
  }

  validateLocationId(payload.associatedLocationId);

  if (payload.active !== undefined && typeof payload.active !== "boolean") {
    throw new AppError("active must be a boolean", 400, "VALIDATION_ERROR");
  }

  if (payload.password !== undefined && typeof payload.password !== "string") {
    throw new AppError("password must be a string", 400, "VALIDATION_ERROR");
  }
};

const toEmployeeResponse = (employee: User): EmployeeResponse => {
  const { password: _password, ...response } = employee;

  return response;
};

const readStringQuery = (value: unknown) => {
  if (Array.isArray(value)) {
    return readStringQuery(value[0]);
  }

  return typeof value === "string" ? value.trim() : undefined;
};

const readBooleanQuery = (value: unknown) => {
  const normalizedValue = readStringQuery(value)?.toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return undefined;
};

const getAssociatedLocationName = (locationId?: string) => {
  if (!locationId) {
    return undefined;
  }

  if (locationId === "todos") {
    return "Todos";
  }

  return locationsService.list().find((location) => location.id === locationId)?.name;
};

const toEmployeeListResponse = (employee: User): EmployeeListResponse => ({
  ...toEmployeeResponse(employee),
  associatedLocationName: getAssociatedLocationName(employee.associatedLocationId)
});

const findUserForDeactivation = (id: string) => {
  const employee = mockUsers.find((user) => user.id === id);

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  if (employee.role === "admin") {
    throw new AppError("Main admin user cannot be deactivated", 403, "FORBIDDEN");
  }

  return employee;
};

const findEmployeeById = (id: string) => {
  const employee = mockUsers.find((user) => user.id === id && user.role === "seller");

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  return employee;
};

const findEmployeeForUpdate = (id: string) => {
  const user = mockUsers.find((item) => item.id === id);

  if (!user) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  if (user.role === "admin") {
    throw new AppError("Main admin user cannot be changed through employee endpoints", 403, "FORBIDDEN");
  }

  return user;
};

const syncAuthUser = (employee: User) => {
  const authUser = mockAuthUsers.find((user) => user.id === employee.id);

  if (!authUser) {
    return;
  }

  authUser.username = employee.email;
  authUser.displayName = employee.name ?? employee.email;
  authUser.email = employee.email;
  authUser.profileImageUrl = employee.profileImageUrl;
  authUser.phone = employee.phone ?? "";
  authUser.associatedLocationId = employee.associatedLocationId;
  authUser.password = employee.password;
  authUser.active = employee.active;
  authUser.updatedAt = employee.updatedAt;
};

export const employeesService = {
  list: (query: ListEmployeesQuery): EmployeeListResponse[] => {
    const search = readStringQuery(query.search)?.toLowerCase();
    const active = readBooleanQuery(query.active);
    const locationId = readStringQuery(query.locationId);

    return mockUsers
      .filter((employee) => employee.role === "seller")
      .filter((employee) => {
        if (!search) {
          return true;
        }

        return [employee.name, employee.email, employee.phone].some((value) => value?.toLowerCase().includes(search));
      })
      .filter((employee) => active === undefined || employee.active === active)
      .filter((employee) => !locationId || employee.associatedLocationId === locationId)
      .map(toEmployeeListResponse);
  },

  getById: (id: string): EmployeeListResponse => {
    return toEmployeeListResponse(findEmployeeById(id));
  },

  create: (payload: CreateEmployeePayload): EmployeeResponse => {
    validateCreatePayload(payload);

    const now = new Date().toISOString();
    const id = randomUUID();
    const email = (payload.email as string).trim().toLowerCase();
    const password = (payload.password as string).trim();
    const name = sanitizeOptionalString(payload.name);
    const phone = sanitizeOptionalString(payload.phone);
    const profileImageUrl = sanitizeOptionalString(payload.profileImageUrl);
    const associatedLocationId = sanitizeOptionalString(payload.associatedLocationId);

    const employee: User = {
      id,
      name,
      email,
      phone,
      profileImageUrl,
      password,
      role: "seller",
      associatedLocationId,
      active: true,
      createdAt: now,
      updatedAt: now
    };

    mockUsers.push(employee);
    mockAuthUsers.push({
      id,
      username: email,
      displayName: name ?? email,
      email,
      profileImageUrl,
      phone: phone ?? "",
      associatedLocationId,
      password,
      role: "seller",
      active: true,
      createdAt: now,
      updatedAt: now
    });

    return toEmployeeResponse(employee);
  },

  update: (id: string, payload: UpdateEmployeePayload): EmployeeListResponse => {
    const employee = findEmployeeForUpdate(id);
    validateUpdatePayload(id, payload);

    const nextPassword =
      typeof payload.password === "string" && payload.password.trim() ? payload.password.trim() : employee.password;

    employee.name = sanitizeOptionalString(payload.name);
    employee.email = (payload.email as string).trim().toLowerCase();
    employee.phone = sanitizeOptionalString(payload.phone);
    employee.profileImageUrl = sanitizeOptionalString(payload.profileImageUrl);
    employee.password = nextPassword;
    employee.associatedLocationId = sanitizeOptionalString(payload.associatedLocationId);

    if (typeof payload.active === "boolean") {
      employee.active = payload.active;
    }

    employee.updatedAt = new Date().toISOString();
    syncAuthUser(employee);

    return toEmployeeListResponse(employee);
  },

  deactivate: (id: string): DeactivateEmployeeResponse => {
    const employee = findUserForDeactivation(id);
    const now = new Date().toISOString();

    employee.active = false;
    employee.updatedAt = now;

    const authUser = mockAuthUsers.find((user) => user.id === id);

    if (authUser) {
      authUser.active = false;
      authUser.updatedAt = now;
    }

    return {
      id: employee.id,
      active: employee.active
    };
  }
};
