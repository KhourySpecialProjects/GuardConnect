import type { Readable } from "stream";

export abstract class StorageAdapter {
  abstract storeStream(filename: string, input: Readable, opts?: FileInputStreamOptions): void;
  abstract delete(path: string): boolean;
  abstract getUrl(path: string): string;
}

export type FileInputStreamOptions = {
  contentType?: string;
};