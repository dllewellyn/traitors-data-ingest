export interface StoragePort {
  save(path: string, content: string): Promise<void>;
}
