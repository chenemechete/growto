import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface Marker {
  marker: string;
  pillar?: string;
  count?: number;
}

interface BehaviorMarkerListProps {
  markers: Marker[];
}

const MARKER_LABELS: Record<string, string> = {
  pauseDetected: "Paused before reacting",
  selfAwarenessShown: "Named your feelings",
  iStatementUsed: "Used 'I' statements",
  boundarySet: "Set a clear boundary",
  calmTone: "Stayed calm under pressure",
  curiosityShown: "Asked instead of assumed",
};

export function BehaviorMarkerList({ markers }: BehaviorMarkerListProps) {
  const detected = markers
    .map((m) => m.marker)
    .filter((m) => MARKER_LABELS[m]);

  const allMarkers = Object.keys(MARKER_LABELS);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Behavior Markers</CardTitle>
        <p className="text-xs text-muted-foreground">
          Skills detected in your practices
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {allMarkers.map((key) => {
          const isDetected = detected.includes(key);
          return (
            <div
              key={key}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                isDetected ? "bg-sage/10 border border-sage/20" : "bg-muted/40"
              }`}
            >
              {isDetected ? (
                <CheckCircle2 size={16} className="text-sage-dark shrink-0" aria-hidden />
              ) : (
                <Circle size={16} className="text-muted-foreground shrink-0" aria-hidden />
              )}
              <span
                className={`text-sm ${
                  isDetected ? "text-dark font-medium" : "text-muted-foreground"
                }`}
              >
                {MARKER_LABELS[key]}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
