import dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config();

export const databaseConfig = {
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT as string) || 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

export const githubConfig = {
  tokenURL: process.env.OAUTH_GITHUB_TOKEN_URL,
  profileURL: process.env.OAUTH_GITHUB_PROFILE_URL,
};

export const serverConfig = {
  port: process.env.SERVER_PORT,
  origin_url: process.env.ORIGIN_URL,
  session_secret: process.env.SESSION_SECRET,
  cookie_domain: process.env.COOKIE_DOMAIN,
};

if (!process.env.AWS_S3_BUCKET_NAME) throw Error('AWS_S3_BUCKET_NAME is Empty');
if (!process.env.AWS_S3_ACCESS_KEY_ID) throw Error('AWS_S3_ACCESS_KEY_ID is Empty');
if (!process.env.AWS_S3_SECRET_ACCESS_KEY) throw Error('AWS_S3_SECRET_ACCESS_KEY is Empty');
if (!process.env.AWS_S3_REGION) throw Error('AWS_S3_REGION is Empty');
if (!process.env.AWS_S3_UPLOAD_FILE_URL) throw Error('S3 AWS_S3_UPLOAD_FILE_URL is Empty');

export const awsS3Config = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
  uploadUrl: process.env.AWS_S3_UPLOAD_FILE_URL,
};
