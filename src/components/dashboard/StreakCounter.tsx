import { Flame } from "lucide-react";

interface StreakCounterProps {
  days: number;
}

export function StreakCounter({ days }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-1">
      <Flame
        size={20}
        className={days > 0 ? "text-orange-500 fill-orange-400" : "text-muted-foreground"}
        aria-hidden
      />
      <div>
        <div className="text-2xl font-bold text-dark">{days}</div>
        <div className="text-xs text-muted-foreground">day streak</div>
      </div>
    </div>
  );
}
