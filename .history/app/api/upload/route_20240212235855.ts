import { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import { mongooseConnect } from '@/lib/mongoose';
// Assuming you have a function for isAdminRequest


const bucketName = 'thearak-next-ecommerce';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongooseConnect();

  const form = new multiparty.Form();
  const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
  console.log("length", files.file.length);

  const client = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  const links: string[] = [];
  for (const file of files.file) {
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;

    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      Body: fs.createReadStream(file.path), // Use createReadStream instead of readFileSync
      ACL: 'public-read',
      ContentType: mime.lookup(file.path) || undefined, // Add undefined check
    }));

    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }

  return res.json({ links });
}

export const config = {
  api: { bodyParser: false },
};
