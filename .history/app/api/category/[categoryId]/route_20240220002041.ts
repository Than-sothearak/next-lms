import { auth } from "@clerk/nextjs";
import { mongooseConnect } from "../../../lib/mongoose";
import { NextResponse } from "next/server";

import { Category } from "@/models/Course";

export async function DELETE(req: Request, res: Response) {

  await mongooseConnect();

    try {
      const { userId } = auth();
      const { name } = await req.json();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const deleteCategory = await Category.findOne({name})
     
            return NextResponse.json(category);
      
    
    } catch (error) {
      console.log("[CategoryS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}