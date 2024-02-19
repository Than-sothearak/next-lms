import { auth } from "@clerk/nextjs";

import { NextResponse } from "next/server";

import { Category } from "@/models/Course";
import { mongooseConnect } from "@/lib/mongoose";

export async function DELETE(req: Request, res: Response) {

  await mongooseConnect();

    try {
      const { userId } = auth();
      const { id } = await req.json();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const deleteCategory = await Category.deleteOne({_id: id})
     
            return NextResponse.json(deleteCategory);
      
    
    } catch (error) {
      console.log("[CategoryS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}