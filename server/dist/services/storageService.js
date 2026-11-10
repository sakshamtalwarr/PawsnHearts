"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
dotenv_1.default.config();
// 1. Cloudinary (100% Free, NO Credit Card Required)
const DEFAULT_CLOUDINARY_CLOUD_NAME = 'dp2kretaw';
const DEFAULT_CLOUDINARY_API_KEY = '168773142822859';
const DEFAULT_CLOUDINARY_API_SECRET = 'REDACTED_CLOUDINARY_SECRET';
let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
let apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl && cloudinaryUrl.includes('@')) {
    try {
        const parsed = new URL(cloudinaryUrl);
        cloudName = cloudName || parsed.hostname;
        apiKey = apiKey || parsed.username;
        apiSecret = apiSecret || parsed.password;
    }
    catch {
        // Ignore URL parse error
    }
}
cloudName = cloudName || DEFAULT_CLOUDINARY_CLOUD_NAME;
apiKey = apiKey || DEFAULT_CLOUDINARY_API_KEY;
apiSecret = apiSecret || DEFAULT_CLOUDINARY_API_SECRET;
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});
const isCloudinaryConfigured = true;
console.log(`✅ Cloudinary Storage initialized (cloud_name: ${cloudName})`);
// 2. Cloudflare R2 (Optional if user has card/PayPal)
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;
const isR2Configured = Boolean(r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName);
let s3Client = null;
if (isR2Configured) {
    s3Client = new client_s3_1.S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: r2AccessKeyId,
            secretAccessKey: r2SecretAccessKey,
        },
    });
    console.log('✅ Cloudflare R2 Storage configured');
}
if (!isCloudinaryConfigured && !isR2Configured) {
    console.log('ℹ️ Running with local disk storage fallback (/uploads). Configure Cloudinary (free, no credit card) whenever you wish.');
}
// Local upload directory fallback
const localUploadDir = process.env.VERCEL ? '/tmp/uploads' : path_1.default.join(__dirname, '../../uploads');
try {
    if (!fs_1.default.existsSync(localUploadDir)) {
        fs_1.default.mkdirSync(localUploadDir, { recursive: true });
    }
}
catch (e) {
    // Read-only filesystem in serverless environments
}
class StorageService {
    /**
     * Upload a file buffer:
     * 1. Priority 1: Cloudinary (Free, No Card)
     * 2. Priority 2: Cloudflare R2 (If configured)
     * 3. Priority 3: Local disk fallback (/uploads)
     */
    static async uploadFile(fileBuffer, originalFilename, mimeType, folder = 'general') {
        // 1. Cloudinary upload
        if (isCloudinaryConfigured) {
            return new Promise((resolve, reject) => {
                const isVideo = mimeType.startsWith('video/');
                const stream = cloudinary_1.v2.uploader.upload_stream({
                    folder: `pawsnhearts/${folder}`,
                    resource_type: isVideo ? 'video' : 'auto',
                }, (error, result) => {
                    if (error || !result) {
                        return reject(error || new Error('Cloudinary upload failed'));
                    }
                    resolve({
                        url: result.secure_url,
                        key: result.public_id,
                        contentType: mimeType,
                        size: result.bytes,
                    });
                });
                stream.end(fileBuffer);
            });
        }
        // 2. Cloudflare R2 upload (if configured)
        if (isR2Configured && s3Client && r2BucketName) {
            const ext = path_1.default.extname(originalFilename) || '';
            const safeKey = `${folder}/${(0, uuid_1.v4)()}${ext}`;
            const command = new client_s3_1.PutObjectCommand({
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
        try {
            const ext = path_1.default.extname(originalFilename) || '';
            const targetFolder = path_1.default.join(localUploadDir, folder);
            if (!fs_1.default.existsSync(targetFolder)) {
                fs_1.default.mkdirSync(targetFolder, { recursive: true });
            }
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            const filePath = path_1.default.join(targetFolder, filename);
            fs_1.default.writeFileSync(filePath, fileBuffer);
            const url = `/uploads/${folder}/${filename}`;
            return {
                url,
                key: `${folder}/${filename}`,
                contentType: mimeType,
                size: fileBuffer.length,
            };
        }
        catch (diskErr) {
            console.warn('Local disk write failed (serverless environment):', diskErr.message);
            return {
                url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
                key: `fallback-${Date.now()}`,
                contentType: mimeType,
                size: fileBuffer.length,
            };
        }
    }
    /**
     * Delete a file by its key
     */
    static async deleteFile(key) {
        try {
            if (isCloudinaryConfigured) {
                await cloudinary_1.v2.uploader.destroy(key);
                return true;
            }
            if (isR2Configured && s3Client && r2BucketName) {
                await s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: r2BucketName,
                    Key: key,
                }));
                return true;
            }
            const localPath = path_1.default.join(localUploadDir, key);
            if (fs_1.default.existsSync(localPath)) {
                fs_1.default.unlinkSync(localPath);
                return true;
            }
            return false;
        }
        catch (err) {
            console.error('Failed to delete file:', err);
            return false;
        }
    }
}
exports.StorageService = StorageService;
