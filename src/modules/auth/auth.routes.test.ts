import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { app } from "../../app";

describe("/api/auth/me", () => {
  let server: Server;
  let baseUrl: string;
  let adminToken: string;
  let workLocationOptions: Array<{ id: string; name: string }>;

  before(() => {
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server.close();
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
