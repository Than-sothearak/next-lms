import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";


const s3Client = new S3Client({
    region: "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    }
});
const bucketName = "thearak-next-ecommerce";
async function uploadFileToS3(file, fileName) {

	const fileBuffer = file;

    
	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: `${fileName}`,
		Body: fileBuffer,
		ACL: 'public-read',
		ContentType: "image/jpg"
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
        const ext = file.name.split(".").pop();
		const newFilename = Date.now() + "." + ext;
       
		const buffer = Buffer.from(await file.arrayBuffer());
		const fileName = await uploadFileToS3(buffer, newFilename);
		
		
		const link = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
		links.push(link);
		return NextResponse.json({ success: true, link});
	} catch (error) {
		return NextResponse.json({ error });
	}
}