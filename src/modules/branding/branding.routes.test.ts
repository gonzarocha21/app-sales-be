import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { app } from "../../app";
import { BrandingRecord, brandingStorage } from "./branding.storage";

describe("GET /api/branding", () => {
  let server: Server;
  let baseUrl: string;

  before(() => {
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server.close();
  });

  it("returns branding data from the mock source", async () => {
    const response = await fetch(`${baseUrl}/api/branding`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      success: true,
      data: {
        companyName: "Alem",
        logoUrl: "/uploads/branding/logo.png",
        tagline: "- Uruguay -"
      }
    });
  });

  it("returns a stable contract when branding values are empty or missing", async () => {
    const originalGet = brandingStorage.get;
    brandingStorage.get = (): BrandingRecord => ({
      companyName: "   ",
      logoUrl: undefined
    });

    try {
      const response = await fetch(`${baseUrl}/api/branding`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(body, {
        success: true,
        data: {
          companyName: "",
          logoUrl: null,
          tagline: ""
        }
      });
    } finally {
      brandingStorage.get = originalGet;
    }
  });
});
