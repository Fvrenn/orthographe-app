import { RULES } from "@/lib/rules";
import { RuleView } from "@/components/RuleView";

export const dynamicParams = false;
export function generateStaticParams() {
  return RULES.map((r) => ({ id: r.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RuleView id={id} />;
}
