"use client";
import { Category } from "@/models/Course";
import { IconType } from "react-icons";
import { 
    FcEngineering,
    FcFilmReel,
    FcMultipleDevices,
    FcMusic,
    FcOldTimeCamera,
    FcSportsMode,
} from "react-icons/fc";
import { CategoryItem } from "./category-item";
interface CategoriesProps {
    items: {
        name: string;
        _id: string;
    }[]
}


const iconMap: Record<typeof Category["name"], IconType> = {
   "Music":FcMusic,
   "Programing": FcMultipleDevices,
   "Digital maketing": FcOldTimeCamera,
}


export const Categories = ({items}: CategoriesProps) => {
    
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
        {items.map((item) => (
            <CategoryItem 
            key={item._id}
            label={item.name}
            icon={iconMap[item.name]}
            value={item._id}
            />
        ))}
        </div>
  )
}
