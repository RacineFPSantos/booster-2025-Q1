import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientColors?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradientColors = "from-blue-500 to-blue-600",
}: FeatureCardProps) {
  return (
    <div className="text-center space-y-4">
      <div
        className={`inline-flex h-20 w-20 rounded-full bg-gradient-to-br ${gradientColors} items-center justify-center shadow-lg`}
      >
        <Icon className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
