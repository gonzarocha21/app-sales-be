import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { app } from "../../app";
import { mockAuthUsers } from "../../mocks/authUsers.mock";

describe("/api/auth/me", () => {
  let server: Server;
  let baseUrl: string;
  let adminToken: string;
  let workLocationOptions: Array<{ id: string; name: string }>;

  before(() => {
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    if (!mockAuthUsers.some((user) => user.id === "user-inactive-auth")) {
      mockAuthUsers.push({
        id: "user-inactive-auth",
        username: "inactive",
        displayName: "Inactive Seller",
        email: "inactive.auth@example.com",
        profileImageUrl: "https://example.com/inactive.jpg",
        phone: "091 222 333",
        associatedLocationId: "location-3",
        password: "inactive",
        role: "seller",
        active: false,
        createdAt: "2026-04-28T00:00:00.000Z",
        updatedAt: "2026-04-28T00:00:00.000Z"
      });
    }
  });

  after(() => {
    server.close();
  });

  it("logs in the MVP admin by username", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        user: {
          id: "user-admin",
          username: "admin",
          email: "gonzalo@alem.com",
          role: "admin",
          associatedLocationId: "todos"
        },
        token: "mock-token-user-admin"
      },
      message: "Login successful"
    });
    assert.equal("password" in body.data.user, false);
  });

  it("logs in an active employee by email", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "martina@alem.com", password: "seller" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        user: {
          id: "user-seller",
          username: "seller",
          email: "martina@alem.com",
          role: "seller",
          associatedLocationId: "location-2"
        },
        token: "mock-token-user-seller"
      },
      message: "Login successful"
    });
    assert.equal("password" in body.data.user, false);
  });

  it("rejects inactive employee login", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "inactive.auth@example.com", password: "inactive" })
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "USER_INACTIVE",
        message: "User is inactive"
      }
    });
  });

  it("rejects invalid login credentials", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "martina@alem.com", password: "wrong" })
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid username or password"
      }
    });
  });

  beforeEach(async () => {
    const locationsResponse = await fetch(`${baseUrl}/api/locations`);
    const locationsBody = await locationsResponse.json();
    workLocationOptions = [
      { id: "todos", name: "Todos" },
      ...locationsBody.data
        .filter((location: { active: boolean }) => location.active)
        .map((location: { id: string; name: string }) => ({
          id: location.id,
          name: location.name
        }))
    ];

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" })
    });
    const loginBody = await loginResponse.json();
    adminToken = loginBody.data.token;

    await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ displayName: "Gonzalo Rocha", phone: "099 123 456", workLocationId: "todos" })
    });
  });

  it("returns the current user profile for an authenticated request", async () => {
    const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });
    const profileBody = await profileResponse.json();

    assert.equal(profileResponse.status, 200);
    assert.deepEqual(profileBody, {
      success: true,
      data: {
        id: "user-admin",
        displayName: "Gonzalo Rocha",
        email: "gonzalo@alem.com",
        avatarUrl: "/uploads/avatars/profile.jpg",
        phone: "099 123 456",
        workLocation: { id: "todos", name: "Todos" },
        workLocationOptions
      }
    });
  });

  it("updates the current user profile for an authenticated request", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ displayName: "Operations Lead", phone: "092 111 222" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: "user-admin",
        displayName: "Operations Lead",
        email: "gonzalo@alem.com",
        avatarUrl: "/uploads/avatars/profile.jpg",
        phone: "092 111 222",
        workLocation: { id: "todos", name: "Todos" },
        workLocationOptions
      }
    });
  });

  it("updates the current user work location for an authenticated request", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ workLocationId: "location-2" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: "user-admin",
        displayName: "Gonzalo Rocha",
        email: "gonzalo@alem.com",
        avatarUrl: "/uploads/avatars/profile.jpg",
        phone: "099 123 456",
        workLocation: { id: "location-2", name: "Local 1" },
        workLocationOptions
      }
    });
  });

  it("returns a standard validation error for invalid profile updates", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ displayName: "   " })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "displayName is required"
      }
    });
  });

  it("returns a standard validation error for invalid work location updates", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ workLocationId: "location-999" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "workLocationId must be a valid location option"
      }
    });
  });

  it("returns a standard validation error for invalid phone updates", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ phone: 123456 })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "phone must be a string"
      }
    });
  });

  it("returns a standard unauthorized error without authentication", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required"
      }
    });
  });

  it("returns a standard unauthorized error for unauthenticated profile updates", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ displayName: "Operations Lead" })
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required"
      }
    });
  });

});
