export interface CrudService<T> {
  list(): T[];
  create(payload: Partial<T>): T;
  getById(id: string): T;
  update(id: string, payload: Partial<T>): T;
  remove(id: string): { id: string };
}
