import type { Readable } from "stream";
import { StorageAdapter, type FileInputStreamOptions } from "./storage-adapter.js";

export class FileSystemStorageAdapter extends StorageAdapter{
  storeStream(filename: string, input: Readable, opts?: FileInputStreamOptions): void {
    return;
  }
  delete(path: string): boolean {
    return false;
  }
  getUrl(path: string): string {
    return "";
  }
}