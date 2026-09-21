import { auth } from "@clerk/nextjs/server";
import { mongooseConnect } from "../../../lib/mongoose";
import { NextResponse } from "next/server";

import { Category } from "@/models/Course";

export async function POST(req: Request) {

  await mongooseConnect();

    try {
      const { userId } = await auth();
      const { name } = await req.json();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const findCategory = await Category.findOne({name})
      if (findCategory){
          return new NextResponse('Category already exists!', { status: 400 });
      } else {
          const category = await Category.create({
              name
            });
            return NextResponse.json(category);
      }
    
    } catch (error) {
      console.log("[CategoryS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}
