import { UserRole } from "../../models";
import { AppError } from "../../utils/AppError";

type LoginPayload = {
  username?: string;
  password?: string;
};

type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};

type HardcodedUser = AuthUser & {
  password: string;
};

const hardcodedUsers: HardcodedUser[] = [
  {
    id: "user-admin",
    username: "admin",
    password: "admin",
    role: "admin"
  },
  {
    id: "user-seller",
    username: "seller",
    password: "seller",
    role: "seller"
  }
];

const invalidCredentialsError = () => {
  throw new AppError("Invalid username or password", 401, "INVALID_CREDENTIALS");
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
        role: authenticatedUser.role
      },
      token: `mock-token-${authenticatedUser.role}`
    };
  }
};
