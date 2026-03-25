import { Badge } from "@/components/ui/badge";
import { RequestStatus } from "../backend.d";
import { useLang } from "../context/LangContext";
import type { TranslationKey } from "../i18n/translations";

const statusConfig: Record<
  RequestStatus,
  { className: string; key: TranslationKey }
> = {
  [RequestStatus.pending]: {
    className: "status-pending border",
    key: "status_pending",
  },
  [RequestStatus.accepted]: {
    className: "status-accepted border",
    key: "status_accepted",
  },
  [RequestStatus.pickedUp]: {
    className: "status-pickedup border",
    key: "status_pickedUp",
  },
  [RequestStatus.delivered]: {
    className: "status-delivered border",
    key: "status_delivered",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useLang();
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2.5 py-0.5 ${config.className}`}
    >
      {t(config.key)}
    </Badge>
  );
}
