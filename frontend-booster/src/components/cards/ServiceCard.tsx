import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
      <div
        className={`h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
