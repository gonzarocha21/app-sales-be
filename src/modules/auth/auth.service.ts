import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { UserRole } from "../../models";
import { AppError } from "../../utils/AppError";
import { locationsService } from "../locations/locations.service";

type LoginPayload = {
  username?: string;
  password?: string;
};

type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string;
  workLocationId: string;
  role: UserRole;
};

type HardcodedUser = AuthUser & {
  password: string;
};

type UpdateCurrentUserProfilePayload = {
  displayName?: unknown;
  phone?: unknown;
  workLocationId?: unknown;
};

type UpdateCurrentUserAvatarPayload = {
  contentType?: string;
  buffer?: Buffer;
};

export type CurrentUserProfile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string;
  workLocation: WorkLocationOption;
  workLocationOptions: WorkLocationOption[];
};

type WorkLocationOption = {
  id: string;
  name: string;
};

const AVATAR_MAX_SIZE_BYTES = 1024 * 1024;
const AVATAR_UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads", "avatars");
const AVATAR_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const hardcodedUsers: HardcodedUser[] = [
  {
    id: "user-admin",
    username: "admin",
    displayName: "Gonzalo Rocha",
    email: "gonzalo@alem.com",
    avatarUrl: "/uploads/avatars/profile.jpg",
    phone: "099 123 456",
    workLocationId: "todos",
    password: "admin",
    role: "admin"
  },
  {
    id: "user-seller",
    username: "seller",
    displayName: "Martina López",
    email: "martina@alem.com",
    avatarUrl: "https://i.pravatar.cc/150?u=martina",
    phone: "098 654 321",
    workLocationId: "location-2",
    password: "seller",
    role: "seller"
  }
];

const invalidCredentialsError = () => {
  throw new AppError("Invalid username or password", 401, "INVALID_CREDENTIALS");
};

const unauthorizedError = () => {
  throw new AppError("Authentication is required", 401);
};

const buildToken = (user: AuthUser) => `mock-token-${user.role}`;

const getWorkLocationOptions = (): WorkLocationOption[] => [
  {
    id: "todos",
    name: "Todos"
  },
  ...locationsService
    .list()
    .filter((location) => location.active)
    .map((location) => ({
      id: location.id,
      name: location.name
    }))
];

const getWorkLocation = (workLocationId: string) => {
  const workLocationOptions = getWorkLocationOptions();

  return workLocationOptions.find((option) => option.id === workLocationId) ?? workLocationOptions[0];
};

const buildProfile = (user: AuthUser): CurrentUserProfile => ({
  id: user.id,
  displayName: user.displayName,
  email: user.email,
  avatarUrl: user.avatarUrl,
  phone: user.phone,
  workLocation: getWorkLocation(user.workLocationId),
  workLocationOptions: getWorkLocationOptions()
});

const validateProfileUpdatePayload = (payload: UpdateCurrentUserProfilePayload) => {
  if (
    payload.displayName !== undefined &&
    (typeof payload.displayName !== "string" || !payload.displayName.trim())
  ) {
    throw new AppError("displayName is required", 400);
  }

  if (payload.phone !== undefined && typeof payload.phone !== "string") {
    throw new AppError("phone must be a string", 400);
  }

  if (payload.workLocationId !== undefined && typeof payload.workLocationId !== "string") {
    throw new AppError("workLocationId must be a valid location option", 400);
  }

  if (
    typeof payload.workLocationId === "string" &&
    !getWorkLocationOptions().some((option) => option.id === payload.workLocationId)
  ) {
    throw new AppError("workLocationId must be a valid location option", 400);
  }

  if (payload.displayName === undefined && payload.phone === undefined && payload.workLocationId === undefined) {
    throw new AppError("displayName, phone or workLocationId is required", 400);
  }
};

const validateAvatarPayload = (payload: UpdateCurrentUserAvatarPayload) => {
  if (!payload.contentType || !AVATAR_CONTENT_TYPES[payload.contentType]) {
    throw new AppError("avatar must be a PNG, JPEG or WEBP image", 400);
  }

  if (!payload.buffer || !Buffer.isBuffer(payload.buffer) || payload.buffer.length === 0) {
    throw new AppError("avatar file is required", 400);
  }

  if (payload.buffer.length > AVATAR_MAX_SIZE_BYTES) {
    throw new AppError("avatar must be 1MB or smaller", 400);
  }
};

const deletePreviousAvatar = (userId: string, avatarUrl: string | null, nextAvatarUrl: string) => {
  if (!avatarUrl || avatarUrl === nextAvatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) {
    return;
  }

  const avatarFileName = path.basename(avatarUrl);

  if (!avatarFileName.startsWith(`${userId}-avatar.`)) {
    return;
  }

  const avatarPath = path.join(process.cwd(), avatarUrl);

  if (existsSync(avatarPath)) {
    unlinkSync(avatarPath);
  }
};

export const authService = {
  login: (payload: LoginPayload) => {
    if (!payload.username || !payload.password) {
      invalidCredentialsError();
    }

    const user = hardcodedUsers.find(
      (item) => item.username === payload.username && item.password === payload.password
    );

    if (!user) {
      invalidCredentialsError();
    }

    const authenticatedUser = user as HardcodedUser;

    return {
      user: {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        displayName: authenticatedUser.displayName,
        email: authenticatedUser.email,
        avatarUrl: authenticatedUser.avatarUrl,
        phone: authenticatedUser.phone,
        workLocationId: authenticatedUser.workLocationId,
        role: authenticatedUser.role
      },
      token: buildToken(authenticatedUser)
    };
  },

  getUserByToken: (token: string): AuthUser => {
    const user = hardcodedUsers.find((item) => buildToken(item) === token);

    if (!user) {
      unauthorizedError();
    }

    return user as AuthUser;
  },

  getProfile: (user: AuthUser): CurrentUserProfile => {
    return buildProfile(user);
  },

  updateProfile: (user: AuthUser, payload: UpdateCurrentUserProfilePayload): CurrentUserProfile => {
    validateProfileUpdatePayload(payload);

    const currentUser = hardcodedUsers.find((item) => item.id === user.id);

    if (!currentUser) {
      unauthorizedError();
    }

    const authenticatedUser = currentUser as HardcodedUser;

    if (payload.displayName !== undefined) {
      authenticatedUser.displayName = (payload.displayName as string).trim();
    }

    if (payload.phone !== undefined) {
      authenticatedUser.phone = (payload.phone as string).trim();
    }

    if (typeof payload.workLocationId === "string") {
      authenticatedUser.workLocationId = payload.workLocationId;
    }

    return buildProfile(authenticatedUser);
  },

  updateAvatar: (user: AuthUser, payload: UpdateCurrentUserAvatarPayload): CurrentUserProfile => {
    validateAvatarPayload(payload);

    const currentUser = hardcodedUsers.find((item) => item.id === user.id);

    if (!currentUser) {
      unauthorizedError();
    }

    const authenticatedUser = currentUser as HardcodedUser;
    const contentType = payload.contentType as keyof typeof AVATAR_CONTENT_TYPES;
    const extension = AVATAR_CONTENT_TYPES[contentType];
    const fileName = `${authenticatedUser.id}-avatar.${extension}`;
    const avatarUrl = `/uploads/avatars/${fileName}`;

    mkdirSync(AVATAR_UPLOAD_DIRECTORY, { recursive: true });
    deletePreviousAvatar(authenticatedUser.id, authenticatedUser.avatarUrl, avatarUrl);
    writeFileSync(path.join(AVATAR_UPLOAD_DIRECTORY, fileName), payload.buffer as Buffer);
    authenticatedUser.avatarUrl = avatarUrl;

    return buildProfile(authenticatedUser);
  }
};
