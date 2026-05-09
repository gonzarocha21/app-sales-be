import { BrandingRecord, mockBranding } from "../../mocks/branding.mock";

export type { BrandingRecord } from "../../mocks/branding.mock";

export const brandingStorage = {
  get: (): BrandingRecord => mockBranding
};
