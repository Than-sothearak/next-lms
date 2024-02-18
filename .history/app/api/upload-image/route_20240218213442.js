import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import mime from "mime-types";


const s3Client = new S3Client({
    region: "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    }
});
const bucketName = "thearak-next-lms";
async function uploadFileToS3(file, fileName) {
	const fileBuffer = file;   
	const contentType = mime.lookup(`${fileName}`) 

	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: `Image/${fileName}`,
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
        const ext = file.name.split(".").pop();
		const newFilename = Date.now() + "." + ext;
	
	
		const buffer = Buffer.from(await file.arrayBuffer());
		const fileName = await uploadFileToS3(buffer, file.name);
		
		
		const link = `https://${bucketName}.s3.amazonaws.com/Image/${fileName}`;
		links.push(link);
		return NextResponse.json({ success: true, link});
	} catch (error) {
		return NextResponse.json({ error });
	}
}