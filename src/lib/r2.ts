import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

export function getR2Client() {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("R2 environment variables are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getPublicUrl(path: string) {
  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL is not configured");
  }
  return `${publicUrl}/${path}`;
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

export async function getFromR2(key: string): Promise<ReadableStream<Uint8Array> | null> {
  const client = getR2Client();

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (!response.Body) return null;

    return response.Body as unknown as ReadableStream<Uint8Array>;
  } catch (error) {
    console.error("Failed to get object from R2:", error);
    return null;
  }
}