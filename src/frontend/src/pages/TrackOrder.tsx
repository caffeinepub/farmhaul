import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RequestStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useLang } from "../context/LangContext";
import {
  useGetMessages,
  useGetTransportRequest,
  useSendMessage,
} from "../hooks/useQueries";

const STEPS: Array<{
  status: RequestStatus;
  key:
    | "track_requested"
    | "track_accepted"
    | "track_picked_up"
    | "track_delivered";
}> = [
  { status: RequestStatus.pending, key: "track_requested" },
  { status: RequestStatus.accepted, key: "track_accepted" },
  { status: RequestStatus.pickedUp, key: "track_picked_up" },
  { status: RequestStatus.delivered, key: "track_delivered" },
];

const STATUS_ORDER: Record<RequestStatus, number> = {
  [RequestStatus.pending]: 0,
  [RequestStatus.accepted]: 1,
  [RequestStatus.pickedUp]: 2,
  [RequestStatus.delivered]: 3,
};

export function TrackOrder() {
  const { t } = useLang();
  const params = useParams({ strict: false }) as { requestId?: string };
  const requestId = BigInt(params.requestId ?? "0");
  const { data: request, isLoading: loadingRequest } =
    useGetTransportRequest(requestId);
  const { data: messages, isLoading: loadingMessages } =
    useGetMessages(requestId);
  const sendMessage = useSendMessage();

  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCount = messages?.length ?? 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: msgCount triggers scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    await sendMessage.mutateAsync({ requestId, message: msg.trim() });
    setMsg("");
  };

  const currentStep = request ? STATUS_ORDER[request.status] : 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          {t("track_title")}
        </h1>
        <p className="text-muted-foreground mb-6">Order #{params.requestId}</p>

        {loadingRequest ? (
          <div
            className="flex justify-center py-12"
            data-ocid="track.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : request ? (
          <>
            {/* Status Stepper */}
            <Card className="border-border shadow-card mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center gap-2 z-10 flex-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium text-center max-w-16 leading-tight ${done ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {t(step.key)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="border-border shadow-card mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {request.cropType}
                  </CardTitle>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t("quantity")}
                  </p>
                  <p className="font-medium">
                    {request.quantityKg.toString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t("price")}</p>
                  <p className="font-medium text-primary">
                    ₹{request.estimatedPrice.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t("from")}</p>
                  <p className="font-medium">{request.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t("to")}</p>
                  <p className="font-medium">{request.dropLocation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  {t("track_chat")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 px-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : !messages?.length ? (
                    <p
                      className="text-center text-sm text-muted-foreground py-8"
                      data-ocid="track.empty_state"
                    >
                      {t("track_no_messages")}
                    </p>
                  ) : (
                    <div className="py-3 space-y-3">
                      {messages.map((m, i) => (
                        <motion.div
                          key={`${m.sender.toString()}-${m.timestamp.toString()}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-secondary/60 rounded-xl px-3 py-2"
                          data-ocid={`track.item.${i + 1}`}
                        >
                          <p className="text-xs text-muted-foreground mb-0.5 font-mono">
                            {m.sender.toString().slice(0, 12)}...
                          </p>
                          <p className="text-sm">{m.message}</p>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="px-4 pb-4 pt-3 border-t border-border">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      placeholder={t("track_message_placeholder")}
                      className="flex-1"
                      data-ocid="track.input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={sendMessage.isPending || !msg.trim()}
                      data-ocid="track.submit_button"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-dashed" data-ocid="track.error_state">
            <CardContent className="p-10 text-center text-muted-foreground">
              Order not found. Please check the order ID.
            </CardContent>
          </Card>
        )}
      </motion.div>
    </main>
  );
}
