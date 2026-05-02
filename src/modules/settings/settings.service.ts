import { AppSettings, LANGUAGES } from "../../models";
import { AppError } from "../../utils/AppError";

type UpdateSettingsPayload = Partial<AppSettings>;

const settings: AppSettings = {
  lowStockThreshold: 1,
  language: "en"
};

const validateSettingsPayload = (payload: UpdateSettingsPayload) => {
  if (
    payload.lowStockThreshold !== undefined &&
    (typeof payload.lowStockThreshold !== "number" || payload.lowStockThreshold < 1)
  ) {
    throw new AppError("lowStockThreshold must be a number greater than or equal to 1", 400);
  }

  if (payload.language !== undefined && !LANGUAGES.includes(payload.language)) {
    throw new AppError("language must be en or es", 400);
  }
};

export const settingsService = {
  get: (): AppSettings => settings,

  update: (payload: UpdateSettingsPayload): AppSettings => {
    validateSettingsPayload(payload);
    Object.assign(settings, payload);

    return settings;
  }
};
