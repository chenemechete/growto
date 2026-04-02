import { HACKAssessment } from "@/components/assessment/HACKAssessment";

export const metadata = { title: "Deep Dive — GrowTo" };

export default async function HACKPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const pillarEnum = pillar.toUpperCase().replace(/-/g, "_");
  return <HACKAssessment pillar={pillarEnum} />;
}
