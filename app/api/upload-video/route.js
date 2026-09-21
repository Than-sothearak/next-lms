import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import mime from "mime-types";


const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "",
    }
});
const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
async function uploadFileToS3(file, fileName) {
	const fileBuffer = file;   
	const contentType = mime.lookup(`${fileName}`) 

	const params = {
		Bucket: bucketName,
		Key: `Video/${fileName}`,
		Body: fileBuffer,
		ACL: 'public-read',
		ContentType: contentType,
	}

	const command = new PutObjectCommand(params);
	await s3Client.send(command);
	return fileName;
}

export async function POST(req) {
	const links = [];
	try {

		const formData = await req.formData();
		const file = formData.get("file");

		if(!file) {
			return NextResponse.json( { error: "File is required."}, { status: 400 } );
		} 
		if (file.size > MAX_VIDEO_SIZE) {
			return NextResponse.json(
				{ error: "Video file must be 10MB or smaller." },
				{ status: 413 }
			);
		}
		if (!bucketName) return NextResponse.json({ error: "AWS bucket is not configured." }, { status: 500 });
		
		const buffer = Buffer.from(await file.arrayBuffer());
		const fileName = await uploadFileToS3(buffer, file.name);
		
		
		const link = `https://${bucketName}.s3.amazonaws.com/Video/${fileName}`;
		links.push(link);
		return NextResponse.json({ success: true, link});
	} catch (error) {
		return NextResponse.json({ error });
	}
}
