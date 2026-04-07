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
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors`}
          >
            <Icon
              className={`h-5 w-5 ${iconColor} group-hover:text-white transition-colors`}
            />
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary">{title}</h3>
        </div>
        <p className="text-sm text-theme-text-secondary">{description}</p>
      </CardContent>
    </Card>
  );
}
