import { Branding } from "../../models";

export type BrandingRecord = Partial<Branding>;

const mockBranding: BrandingRecord = {
  companyName: "Alem",
  logoUrl: "/uploads/branding/logo.png",
  tagline: "- Uruguay -"
};

export const brandingStorage = {
  get: (): BrandingRecord => mockBranding
};
