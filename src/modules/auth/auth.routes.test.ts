import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { app } from "../../app";

describe("/api/auth/me", () => {
  let server: Server;
  let baseUrl: string;
  let adminToken: string;

  before(() => {
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server.close();
  });

  beforeEach(async () => {
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
      body: JSON.stringify({ displayName: "Gonzalo Rocha" })
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
        avatarUrl: "/uploads/avatars/profile.jpg"
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
      body: JSON.stringify({ displayName: "Operations Lead" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: "user-admin",
        displayName: "Operations Lead",
        email: "gonzalo@alem.com",
        avatarUrl: "/uploads/avatars/profile.jpg"
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

  it("updates the current user avatar for a valid image upload", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me/avatar`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "image/png"
      },
      body: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: "user-admin",
        displayName: "Gonzalo Rocha",
        email: "gonzalo@alem.com",
        avatarUrl: "/uploads/avatars/user-admin-avatar.png"
      }
    });
  });

  it("returns a standard validation error for invalid avatar file types", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me/avatar`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "text/plain"
      },
      body: "not an image"
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "avatar must be a PNG, JPEG or WEBP image"
      }
    });
  });

  it("returns a standard validation error for avatar files over 1MB", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me/avatar`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "image/png"
      },
      body: Buffer.alloc(1024 * 1024 + 1)
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "avatar must be 1MB or smaller"
      }
    });
  });

  it("returns a standard unauthorized error for unauthenticated avatar uploads", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me/avatar`, {
      method: "PUT",
      headers: {
        "content-type": "image/png"
      },
      body: Buffer.from([0x89, 0x50, 0x4e, 0x47])
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
