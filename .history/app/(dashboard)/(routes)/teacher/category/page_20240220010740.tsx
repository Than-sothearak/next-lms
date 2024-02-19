import { Button } from "@/components/ui/button";
import { mongooseConnect } from "@/lib/mongoose";

import { Category } from "@/models/Course";
import Link from "next/link";
import React from "react";
import { DataTable } from "../courses/_components/data-table";
import { categoryColumns } from "./_components/category-columns";

mongooseConnect();

const CategoryPage = async () => {
  const category = await Category.find({}).sort({ createdAt: -1 });
  const categories = JSON.parse(JSON.stringify(category));
  return (
    <>
      <div className="p-6">
        <Link href="/teacher/createcat">
          <Button>Create category</Button>
        </Link>
      </div>
      <div className="p-6">
        <DataTable columns={categoryColumns} data={categories} />
      </div>
    </>
  );
};

export default CategoryPage;
