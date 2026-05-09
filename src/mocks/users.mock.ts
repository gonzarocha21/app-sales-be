import { User } from "../models";

const seededAt = "2026-04-28T00:00:00.000Z";

export const mockUsers: User[] = [
  {
    id: "user-admin",
    name: "Gonzalo Rocha",
    email: "gonzalo@alem.com",
    phone: "099 123 456",
    profileImageUrl: "/uploads/avatars/profile.jpg",
    password: "admin",
    role: "admin",
    associatedLocationId: "todos",
    active: true,
    createdAt: seededAt,
    updatedAt: seededAt
  },
  {
    id: "user-seller",
    name: "Martina López",
    email: "martina@alem.com",
    phone: "098 654 321",
    profileImageUrl: "https://i.pravatar.cc/150?u=martina",
    password: "seller",
    role: "seller",
    associatedLocationId: "location-2",
    active: true,
    createdAt: seededAt,
    updatedAt: seededAt
  }
];
