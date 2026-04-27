type Setting = {
  id: string;
  key: string;
  value: string;
};

const mockSettings: Setting[] = [
  {
    id: "setting-1",
    key: "currency",
    value: "USD"
  }
];

export const settingsService = {
  list: () => mockSettings,
  create: (payload: Partial<Setting>): Setting => ({
    id: "setting-new",
    key: payload.key ?? "setting.key",
    value: payload.value ?? "placeholder"
  }),
  getById: (id: string): Setting => ({
    ...mockSettings[0],
    id
  }),
  update: (id: string, payload: Partial<Setting>): Setting => ({
    ...mockSettings[0],
    ...payload,
    id
  }),
  remove: (id: string) => ({ id })
};
