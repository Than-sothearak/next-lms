import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import { Category } from "@/models/Course";
import { mongooseConnect } from "@/lib/mongoose";

export async function DELETE(req: Request,  { params }: { params: Promise<{ categoryId: string }>}) {

  await mongooseConnect();

    try {
      const { userId } = await auth();
      const { categoryId } = await params;
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const deleteCategory = await Category.deleteOne({_id: categoryId})
     
            return NextResponse.json(deleteCategory);
      
    
    } catch (error) {
      console.log("[CategoryS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}