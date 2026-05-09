import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { UserRole } from "../../models";
import { MockAuthUser, mockAuthUsers } from "../../mocks/authUsers.mock";
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
  profileImageUrl?: string;
  phone: string;
  associatedLocationId?: string;
  role: UserRole;
};

type LoginResponseUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  associatedLocationId?: string;
};

type HardcodedUser = MockAuthUser;

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

const authUsers = mockAuthUsers;

const invalidCredentialsError = (): never => {
  throw new AppError("Invalid username or password", 401, "INVALID_CREDENTIALS");
};

const userInactiveError = (): never => {
  throw new AppError("User is inactive", 403, "USER_INACTIVE");
};

const unauthorizedError = (): never => {
  throw new AppError("Authentication is required", 401);
};

const buildToken = (user: AuthUser) => `mock-token-${user.id}`;

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

const getWorkLocation = (associatedLocationId: string | undefined) => {
  const workLocationOptions = getWorkLocationOptions();

  return workLocationOptions.find((option) => option.id === associatedLocationId) ?? workLocationOptions[0];
};

const buildProfile = (user: AuthUser): CurrentUserProfile => ({
  id: user.id,
  displayName: user.displayName,
  email: user.email,
  avatarUrl: user.profileImageUrl ?? null,
  phone: user.phone,
  workLocation: getWorkLocation(user.associatedLocationId),
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
    const loginUsername = payload.username;
    const loginPassword = payload.password;

    if (typeof loginUsername !== "string" || !loginUsername.trim() || typeof loginPassword !== "string" || !loginPassword) {
      invalidCredentialsError();
    }

    const username = (loginUsername as string).trim().toLowerCase();
    const password = loginPassword as string;
    const user = authUsers.find((item) => {
      const loginIdentifier = item.role === "admin" ? item.username : item.email;

      return loginIdentifier.toLowerCase() === username && item.password === password;
    });

    if (!user) {
      invalidCredentialsError();
    }

    const authenticatedUser = user as HardcodedUser;

    if (!authenticatedUser.active) {
      userInactiveError();
    }

    const responseUser: LoginResponseUser = {
      id: authenticatedUser.id,
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      associatedLocationId: authenticatedUser.associatedLocationId
    };

    return {
      user: responseUser,
      token: buildToken(authenticatedUser)
    };
  },

  getUserByToken: (token: string): AuthUser => {
    const user = authUsers.find((item) => buildToken(item) === token);

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

    const currentUser = authUsers.find((item) => item.id === user.id);

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
      authenticatedUser.associatedLocationId = payload.workLocationId;
    }

    return buildProfile(authenticatedUser);
  },

  updateAvatar: (user: AuthUser, payload: UpdateCurrentUserAvatarPayload): CurrentUserProfile => {
    validateAvatarPayload(payload);

    const currentUser = authUsers.find((item) => item.id === user.id);

    if (!currentUser) {
      unauthorizedError();
    }

    const authenticatedUser = currentUser as HardcodedUser;
    const contentType = payload.contentType as keyof typeof AVATAR_CONTENT_TYPES;
    const extension = AVATAR_CONTENT_TYPES[contentType];
    const fileName = `${authenticatedUser.id}-avatar.${extension}`;
    const avatarUrl = `/uploads/avatars/${fileName}`;

    mkdirSync(AVATAR_UPLOAD_DIRECTORY, { recursive: true });
    deletePreviousAvatar(authenticatedUser.id, authenticatedUser.profileImageUrl ?? null, avatarUrl);
    writeFileSync(path.join(AVATAR_UPLOAD_DIRECTORY, fileName), payload.buffer as Buffer);
    authenticatedUser.profileImageUrl = avatarUrl;

    return buildProfile(authenticatedUser);
  }
};
