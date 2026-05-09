import { UserRole } from "../models";

export type MockAuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profileImageUrl?: string;
  phone: string;
  associatedLocationId?: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const seededAt = "2026-04-28T00:00:00.000Z";

export const mockAuthUsers: MockAuthUser[] = [
  {
    id: "user-admin",
    username: "admin",
    displayName: "Gonzalo Rocha",
    email: "gonzalo@alem.com",
    profileImageUrl: "/uploads/avatars/profile.jpg",
    phone: "099 123 456",
    associatedLocationId: "todos",
    password: "admin",
    role: "admin",
    active: true,
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "user-seller",
    username: "seller",
    displayName: "Martina López",
    email: "martina@alem.com",
    profileImageUrl: "https://i.pravatar.cc/150?u=martina",
    phone: "098 654 321",
    associatedLocationId: "location-2",
    password: "seller",
    role: "seller",
    active: true,
    createdAt: seededAt,
    updatedAt: seededAt
  }
];
