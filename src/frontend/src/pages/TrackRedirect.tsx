import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "../context/LangContext";

export function TrackRedirect() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate({ to: `/track/${orderId.trim()}` });
    }
  };

  return (
    <main className="container mx-auto px-4 py-16 max-w-md">
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="font-display">{t("track_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order number..."
                data-ocid="track.input"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              data-ocid="track.submit_button"
            >
              Track Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
