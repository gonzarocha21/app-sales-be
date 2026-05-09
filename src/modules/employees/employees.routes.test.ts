import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { app } from "../../app";
import { mockUsers } from "../../mocks/users.mock";

describe("/api/employees", () => {
  let server: Server;
  let baseUrl: string;
  let adminToken: string;
  let sellerToken: string;

  before(async () => {
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    const adminLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" })
    });
    const adminLoginBody = await adminLoginResponse.json();
    adminToken = adminLoginBody.data.token;

    const sellerLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "martina@alem.com", password: "seller" })
    });
    const sellerLoginBody = await sellerLoginResponse.json();
    sellerToken = sellerLoginBody.data.token;

    mockUsers.push({
      id: "user-inactive-seller",
      name: "Inactive Seller",
      email: "inactive.seller@example.com",
      phone: "091 222 333",
      profileImageUrl: "https://example.com/inactive.jpg",
      password: "inactive",
      role: "seller",
      associatedLocationId: "location-3",
      active: false,
      createdAt: "2026-04-28T00:00:00.000Z",
      updatedAt: "2026-04-28T00:00:00.000Z"
    });
  });

  after(() => {
    server.close();
  });

  it("lists employees as an admin without returning passwords", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(Array.isArray(body.data), true);
    assert.equal(body.data.some((employee: Record<string, unknown>) => employee.id === "user-admin"), false);
    assert.equal(body.data.every((employee: Record<string, unknown>) => employee.role === "seller"), true);
    assert.equal(body.data.every((employee: Record<string, unknown>) => !("password" in employee)), true);

    const seller = body.data.find((employee: Record<string, unknown>) => employee.id === "user-seller");
    assert.equal(seller.associatedLocationId, "location-2");
    assert.equal(seller.associatedLocationName, "Local 1");
  });

  it("returns FORBIDDEN when a seller tries to list employees", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      headers: { authorization: `Bearer ${sellerToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required"
      }
    });
  });

  it("searches employees by name, email, or phone", async () => {
    const response = await fetch(`${baseUrl}/api/employees?search=martina`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].id, "user-seller");
  });

  it("filters employees by active status", async () => {
    const response = await fetch(`${baseUrl}/api/employees?active=false`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].id, "user-inactive-seller");
    assert.equal(body.data[0].active, false);
  });

  it("filters employees by associated location", async () => {
    const response = await fetch(`${baseUrl}/api/employees?locationId=location-2`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].id, "user-seller");
    assert.equal(body.data[0].associatedLocationId, "location-2");
  });

  it("returns employee detail as an admin without returning password", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: "user-seller",
        name: "Martina López",
        email: "martina@alem.com",
        phone: "098 654 321",
        profileImageUrl: "https://i.pravatar.cc/150?u=martina",
        role: "seller",
        associatedLocationId: "location-2",
        associatedLocationName: "Local 1",
        active: true,
        createdAt: "2026-04-28T00:00:00.000Z",
        updatedAt: "2026-04-28T00:00:00.000Z"
      }
    });
    assert.equal("password" in body.data, false);
  });

  it("returns FORBIDDEN when a seller tries to view employee detail", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      headers: { authorization: `Bearer ${sellerToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required"
      }
    });
  });

  it("returns NOT_FOUND when employee detail does not exist", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-missing`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Employee not found"
      }
    });
  });

  it("creates an employee as an admin without returning password", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "New Seller",
        email: "new.seller@example.com",
        phone: "092 111 222",
        profileImageUrl: "https://example.com/avatar.jpg",
        password: "secret",
        associatedLocationId: "location-2"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.message, "Employee created successfully");
    assert.equal(typeof body.data.id, "string");
    assert.equal(body.data.name, "New Seller");
    assert.equal(body.data.email, "new.seller@example.com");
    assert.equal(body.data.phone, "092 111 222");
    assert.equal(body.data.profileImageUrl, "https://example.com/avatar.jpg");
    assert.equal(body.data.role, "seller");
    assert.equal(body.data.associatedLocationId, "location-2");
    assert.equal(body.data.active, true);
    assert.equal(typeof body.data.createdAt, "string");
    assert.equal(typeof body.data.updatedAt, "string");
    assert.equal("password" in body.data, false);
  });

  it("returns FORBIDDEN when a seller tries to create an employee", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${sellerToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: "seller-created@example.com",
        password: "secret"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required"
      }
    });
  });

  it("validates required email", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ password: "secret" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("validates email format", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "invalid-email", password: "secret" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_EMAIL");
  });

  it("validates unique email", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "gonzalo@alem.com", password: "secret" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "EMAIL_ALREADY_EXISTS");
  });

  it("validates associated location existence", async () => {
    const response = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: "bad.location@example.com",
        password: "secret",
        associatedLocationId: "location-999"
      })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "LOCATION_NOT_FOUND");
  });

  it("updates an employee as an admin without returning password", async () => {
    const createResponse = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Update Test Seller",
        email: "update.test.seller@example.com",
        phone: "090 111 222",
        password: "old-secret",
        associatedLocationId: "location-2"
      })
    });
    const createBody = await createResponse.json();

    const response = await fetch(`${baseUrl}/api/employees/${createBody.data.id}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Updated Seller",
        email: "updated.seller@example.com",
        phone: "092 333 444",
        profileImageUrl: "https://example.com/updated.jpg",
        password: "",
        associatedLocationId: "location-3",
        active: true
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.message, "Employee updated successfully");
    assert.equal(body.data.id, createBody.data.id);
    assert.equal(body.data.name, "Updated Seller");
    assert.equal(body.data.email, "updated.seller@example.com");
    assert.equal(body.data.phone, "092 333 444");
    assert.equal(body.data.profileImageUrl, "https://example.com/updated.jpg");
    assert.equal(body.data.role, "seller");
    assert.equal(body.data.associatedLocationId, "location-3");
    assert.equal(body.data.associatedLocationName, "Local 2");
    assert.equal(body.data.active, true);
    assert.equal(body.data.createdAt, createBody.data.createdAt);
    assert.equal(typeof body.data.updatedAt, "string");
    assert.equal("password" in body.data, false);

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "updated.seller@example.com", password: "old-secret" })
    });

    assert.equal(loginResponse.status, 200);
  });

  it("updates employee password when a non-empty password is provided", async () => {
    const createResponse = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: "password.update.seller@example.com",
        password: "old-secret",
        associatedLocationId: "location-2"
      })
    });
    const createBody = await createResponse.json();

    const response = await fetch(`${baseUrl}/api/employees/${createBody.data.id}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: "password.update.seller@example.com",
        password: "new-secret",
        associatedLocationId: "location-2",
        active: true
      })
    });

    assert.equal(response.status, 200);

    const oldLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "password.update.seller@example.com", password: "old-secret" })
    });
    const newLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "password.update.seller@example.com", password: "new-secret" })
    });

    assert.equal(oldLoginResponse.status, 401);
    assert.equal(newLoginResponse.status, 200);
  });

  it("returns FORBIDDEN when a seller tries to update an employee", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${sellerToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "seller-update@example.com" })
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required"
      }
    });
  });

  it("returns EMPLOYEE_NOT_FOUND when updating an employee that does not exist", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-missing`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "missing@example.com" })
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee not found"
      }
    });
  });

  it("validates employee update email", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "invalid-email" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_EMAIL");
  });

  it("validates required employee update email", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ phone: "092 111 222" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("validates unique employee update email excluding the current employee", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "gonzalo@alem.com" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "EMAIL_ALREADY_EXISTS");
  });

  it("validates employee update associated location existence", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "martina@alem.com", associatedLocationId: "location-999" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "LOCATION_NOT_FOUND");
  });

  it("prevents changing the main admin through the employee update endpoint", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-admin`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: "admin.update@example.com" })
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Main admin user cannot be changed through employee endpoints"
      }
    });
  });

  it("deactivates an employee as an admin without deleting the record", async () => {
    const createResponse = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Delete Test Seller",
        email: "delete.test.seller@example.com",
        password: "secret",
        associatedLocationId: "location-2"
      })
    });
    const createBody = await createResponse.json();

    const response = await fetch(`${baseUrl}/api/employees/${createBody.data.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        id: createBody.data.id,
        active: false
      },
      message: "Employee deactivated successfully"
    });

    const listResponse = await fetch(`${baseUrl}/api/employees?active=false`, {
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const listBody = await listResponse.json();
    const deactivatedEmployee = listBody.data.find(
      (employee: Record<string, unknown>) => employee.id === createBody.data.id
    );

    assert.equal(deactivatedEmployee.active, false);
  });

  it("prevents deactivated employees from logging in", async () => {
    const createResponse = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: "inactive.login.test@example.com",
        password: "secret",
        associatedLocationId: "location-2"
      })
    });
    const createBody = await createResponse.json();

    await fetch(`${baseUrl}/api/employees/${createBody.data.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` }
    });

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "inactive.login.test@example.com", password: "secret" })
    });
    const loginBody = await loginResponse.json();

    assert.equal(loginResponse.status, 403);
    assert.deepEqual(loginBody, {
      success: false,
      error: {
        code: "USER_INACTIVE",
        message: "User is inactive"
      }
    });
  });

  it("returns FORBIDDEN when a seller tries to deactivate an employee", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-seller`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${sellerToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access is required"
      }
    });
  });

  it("returns NOT_FOUND when deactivating an employee that does not exist", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-missing`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Employee not found"
      }
    });
  });

  it("prevents deactivating the main admin user", async () => {
    const response = await fetch(`${baseUrl}/api/employees/user-admin`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` }
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(body, {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Main admin user cannot be deactivated"
      }
    });
  });
});
