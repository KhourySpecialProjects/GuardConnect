import { FileRepository } from "../data/repository/file-repo.js";
import { FileSystemStorageAdapter } from "../storage/filesystem-adapter.js";
import { S3Adapter } from "../storage/s3-adapter.js";
import type { StorageAdapter } from "../storage/storage-adapter.js";

/**
 * Policy Engine that handles everything related to access control (checking access, granting access, etc.)
 */
export class FileEngine {
  private STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH ?? '../storage/';
  private fileRepository: FileRepository;
  private adapter: StorageAdapter;

  // const backend = (process.env.STORAGE_BACKEND ?? "fs").toLowerCase();
  // if (backend === "s3") {
  //   return createS3Storage();
  // }
  // return createFsStorage();

  constructor(fileRepository: FileRepository, adapter?: StorageAdapter) {
    this.fileRepository = fileRepository ?? new FileRepository();
    const backend = (process.env.STORAGE_BACKEND ?? "fs").toLowerCase();
    this.adapter = adapter ?? (backend === "s3" ? new S3Adapter() : new FileSystemStorageAdapter());
  }

  // stream incoming file using something like this:
  // public async storeStream(filename: string, input: Readable): Promise<{ path: string }> {
  //   const destDir = path.resolve(process.cwd(), this.STORAGE_BASE_PATH);
  //   await fsp.mkdir(destDir, { recursive: true });
  //   const tmpName = `${filename}.${randomUUID()}.tmp`;
  //   const tmpPath = path.join(destDir, tmpName);
  //   const finalPath = path.join(destDir, filename);
  //   // createWriteStream (callback-style) for piping
  //   const ws = fs.createWriteStream(tmpPath, { flags: "w" });
  //   try {
  //     // pipeline will throw if the stream errors
  //     await pipeline(input as any, ws);
  //     // move into final location atomically
  //     await fsp.rename(tmpPath, finalPath);
  //     return { path: finalPath };
  //   } catch (err) {
  //     // cleanup temp file on error
  //     try { await fsp.unlink(tmpPath); } catch (_) { /* ignore */ }
  //     throw err;
  //   }
  // }
}
