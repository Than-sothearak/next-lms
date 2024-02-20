import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Course";
import React from "react";
import { categoryColumns } from "./_components/category-columns";
import { CategoryDataTable } from "./_components/category-data-table";

mongooseConnect();

const CategoryPage = async () => {
  const category = await Category.find({}).sort({ createdAt: -1 });
  const categories = JSON.parse(JSON.stringify(category));
  return (
    <>
      <div className="p-6">
        <CategoryDataTable columns={categoryColumns} data={categories} />
      </div>
    </>
  );
};

export default CategoryPage;
