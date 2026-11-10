import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

const isR2Configured = Boolean(
  r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName
);

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId!,
      secretAccessKey: r2SecretAccessKey!,
    },
  });
  console.log('✅ Cloudflare R2 Storage configured');
} else {
  console.log('ℹ️ Cloudflare R2 not fully configured. Using local disk storage fallback (/uploads)');
}

// Local upload directory fallback
const localUploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

export interface UploadResult {
  url: string;
  key: string;
  contentType: string;
  size: number;
}

export class StorageService {
  /**
   * Upload a file buffer or stream to Cloudflare R2, or save to disk fallback
   */
  static async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
    const ext = path.extname(originalFilename) || '';
    const safeKey = `${folder}/${uuidv4()}${ext}`;

    if (isR2Configured && s3Client && r2BucketName) {
      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: safeKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      const publicBase = r2PublicUrl ? r2PublicUrl.replace(/\/$/, '') : `https://${r2BucketName}.r2.dev`;
      const url = `${publicBase}/${safeKey}`;

      return {
        url,
        key: safeKey,
        contentType: mimeType,
        size: fileBuffer.length,
      };
    } else {
      // Local storage fallback
      const targetFolder = path.join(localUploadDir, folder);
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(targetFolder, filename);
      fs.writeFileSync(filePath, fileBuffer);

      const url = `/uploads/${folder}/${filename}`;

      return {
        url,
        key: `${folder}/${filename}`,
        contentType: mimeType,
        size: fileBuffer.length,
      };
    }
  }

  /**
   * Delete a file by its key
   */
  static async deleteFile(key: string): Promise<boolean> {
    try {
      if (isR2Configured && s3Client && r2BucketName) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: key,
          })
        );
        return true;
      } else {
        const localPath = path.join(localUploadDir, key);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to delete file:', err);
      return false;
    }
  }
}
