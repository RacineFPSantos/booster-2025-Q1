interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-blue-600">
        {value}
      </div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}

interface StatsSectionProps {
  stats: StatItemProps[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
      {stats.map((stat, index) => (
        <StatItem key={index} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
}
