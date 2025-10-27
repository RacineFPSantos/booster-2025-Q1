import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
}

export function CategoryCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500"
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        <div
          className={`h-16 w-16 rounded-lg ${iconBgColor} flex items-center justify-center group-hover:bg-blue-600 transition-colors`}
        >
          <Icon
            className={`h-8 w-8 ${iconColor} group-hover:text-white transition-colors`}
          />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
