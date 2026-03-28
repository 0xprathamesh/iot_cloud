import { Badge } from "@/components/ui/badge";

export function DeviceStatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" ? "active" : status === "disabled" ? "disabled" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}
