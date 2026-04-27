type AuthPlaceholder = {
  id: string;
  email: string;
  token: string;
};

const mockAuthRecords: AuthPlaceholder[] = [
  {
    id: "auth-1",
    email: "admin@example.com",
    token: "placeholder-token"
  }
];

export const authService = {
  list: () => mockAuthRecords,
  create: (payload: Partial<AuthPlaceholder>): AuthPlaceholder => ({
    id: "auth-new",
    email: payload.email ?? "user@example.com",
    token: "placeholder-token"
  }),
  getById: (id: string): AuthPlaceholder => ({
    ...mockAuthRecords[0],
    id
  }),
  update: (id: string, payload: Partial<AuthPlaceholder>): AuthPlaceholder => ({
    ...mockAuthRecords[0],
    ...payload,
    id
  }),
  remove: (id: string) => ({ id })
};
