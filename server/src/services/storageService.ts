import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 1. Cloudinary (100% Free, NO Credit Card Required)
let isCloudinaryConfigured = false;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
  isCloudinaryConfigured = true;
  console.log('✅ Cloudinary Storage configured via CLOUDINARY_URL (No Credit Card required)');
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  // If user pasted a cloud name with space or display name, extract from URL or sanitize
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME.includes(' ') && process.env.CLOUDINARY_URL
    ? process.env.CLOUDINARY_URL.split('@')[1]
    : process.env.CLOUDINARY_CLOUD_NAME.trim();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
  isCloudinaryConfigured = true;
  console.log('✅ Cloudinary Storage configured (No Credit Card required)');
}

// 2. Cloudflare R2 (Optional if user has card/PayPal)
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
}

if (!isCloudinaryConfigured && !isR2Configured) {
  console.log('ℹ️ Running with local disk storage fallback (/uploads). Configure Cloudinary (free, no credit card) whenever you wish.');
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
   * Upload a file buffer:
   * 1. Priority 1: Cloudinary (Free, No Card)
   * 2. Priority 2: Cloudflare R2 (If configured)
   * 3. Priority 3: Local disk fallback (/uploads)
   */
  static async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
    // 1. Cloudinary upload
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const isVideo = mimeType.startsWith('video/');
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `pawsnhearts/${folder}`,
            resource_type: isVideo ? 'video' : 'auto',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
              url: result.secure_url,
              key: result.public_id,
              contentType: mimeType,
              size: result.bytes,
            });
          }
        );
        stream.end(fileBuffer);
      });
    }

    // 2. Cloudflare R2 upload (if configured)
    if (isR2Configured && s3Client && r2BucketName) {
      const ext = path.extname(originalFilename) || '';
      const safeKey = `${folder}/${uuidv4()}${ext}`;

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
    }

    // 3. Local disk fallback
    const ext = path.extname(originalFilename) || '';
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

  /**
   * Delete a file by its key
   */
  static async deleteFile(key: string): Promise<boolean> {
    try {
      if (isCloudinaryConfigured) {
        await cloudinary.uploader.destroy(key);
        return true;
      }

      if (isR2Configured && s3Client && r2BucketName) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: key,
          })
        );
        return true;
      }

      const localPath = path.join(localUploadDir, key);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete file:', err);
      return false;
    }
  }
}
