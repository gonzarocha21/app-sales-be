import { randomUUID } from "crypto";
import { Location, LocationType } from "../../models";
import { AppError } from "../../utils/AppError";

const locations: Location[] = [
  {
    id: "location-1",
    name: "Main Warehouse",
    type: "warehouse",
    active: true
  }
];

type CreateLocationPayload = Pick<Location, "name" | "type"> & Partial<Pick<Location, "active">>;
type UpdateLocationPayload = Partial<Omit<Location, "id">>;

const locationTypes: LocationType[] = ["warehouse", "store"];

const findActiveLocation = (id: string) => {
  const location = locations.find((item) => item.id === id && item.active);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return location;
};

const validateLocationType = (type: unknown) => {
  if (!locationTypes.includes(type as LocationType)) {
    throw new AppError("Location type must be warehouse or store", 400);
  }
};

const validateCreatePayload = (payload: Partial<CreateLocationPayload>) => {
  if (!payload.name || !payload.type) {
    throw new AppError("Location name and type are required", 400);
  }

  validateLocationType(payload.type);
};

export const locationsService = {
  list: () => locations.filter((location) => location.active),

  create: (payload: Partial<CreateLocationPayload>): Location => {
    validateCreatePayload(payload);
    const validPayload = payload as CreateLocationPayload;

    const location: Location = {
      id: randomUUID(),
      name: validPayload.name,
      type: validPayload.type,
      active: validPayload.active ?? true
    };

    locations.push(location);

    return location;
  },

  getById: (id: string): Location => findActiveLocation(id),

  update: (id: string, payload: UpdateLocationPayload): Location => {
    const location = findActiveLocation(id);

    if (payload.type !== undefined) {
      validateLocationType(payload.type);
    }

    Object.assign(location, payload, { id });

    return location;
  },

  remove: (id: string): Location => {
    const location = findActiveLocation(id);

    location.active = false;

    return location;
  }
};
