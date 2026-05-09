import { Branding } from "../models";

export type BrandingRecord = Partial<Branding>;

export const mockBranding: BrandingRecord = {
  companyName: "Alem",
  logoUrl: "/uploads/branding/logo.png",
  tagline: "- Uruguay -"
};
