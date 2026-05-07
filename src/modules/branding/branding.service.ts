import { Branding } from "../../models";
import { BrandingRecord, brandingStorage } from "./branding.storage";

const normalizeText = (value: string | null | undefined) => value?.trim() ?? "";

const normalizeLogoUrl = (value: string | null | undefined) => {
  const logoUrl = value?.trim();

  return logoUrl ? logoUrl : null;
};

const normalizeBranding = (branding: BrandingRecord): Branding => ({
  companyName: normalizeText(branding.companyName),
  logoUrl: normalizeLogoUrl(branding.logoUrl),
  tagline: normalizeText(branding.tagline)
});

export const brandingService = {
  get: (): Branding => normalizeBranding(brandingStorage.get())
};
