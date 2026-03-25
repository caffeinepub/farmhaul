import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  MapPin,
  Package,
  Truck,
  Weight,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { RequestStatus } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllRequests } from "../hooks/useQueries";

function formatTime(ns: bigint) {
  try {
    const ms = Number(ns / BigInt(1_000_000));
    return new Date(ms).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function formatPrice(price: bigint) {
  return `₹${price.toString()}`;
}

export function DriverPortfolio() {
  const { profile } = useAuth();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: allRequests, isLoading } = useGetAllRequests();

  const myPrincipal = identity?.getPrincipal();

  const deliveredJobs =
    allRequests?.filter(
      (r) =>
        r.status === RequestStatus.delivered &&
        r.driver?.toString() === myPrincipal?.toString(),
    ) ?? [];

  const activeJobs =
    allRequests?.filter(
      (r) =>
        (r.status === RequestStatus.accepted ||
          r.status === RequestStatus.pickedUp) &&
        r.driver?.toString() === myPrincipal?.toString(),
    ) ?? [];

  const totalKg = deliveredJobs.reduce(
    (sum, r) => sum + Number(r.quantityKg),
    0,
  );

  const initials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DR";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Portfolio link copied!");
  };

  if (!profile) {
    return (
      <div
        className="container mx-auto px-4 py-12 text-center"
        data-ocid="portfolio.error_state"
      >
        <p className="text-muted-foreground mb-4">
          Please login to view your portfolio.
        </p>
        <Button onClick={() => navigate({ to: "/login" })}>Login</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/driver" })}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="portfolio.link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="border-border shadow-card overflow-hidden">
          <div
            className="h-28 relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.12 145) 0%, oklch(0.48 0.15 155) 50%, oklch(0.6 0.14 75) 100%)",
            }}
          />
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div
                  className="w-24 h-24 rounded-2xl border-4 border-card flex items-center justify-center text-2xl font-display font-bold text-primary-foreground shadow-card"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.165 145), oklch(0.42 0.14 155))",
                  }}
                  data-ocid="portfolio.card"
                >
                  {initials}
                </div>
                <div className="mb-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {profile.displayName}
                  </h1>
                  <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 font-medium">
                    <Truck className="w-3 h-3 mr-1" />
                    Driver
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 shrink-0"
                data-ocid="portfolio.secondary_button"
              >
                <Copy className="w-4 h-4" />
                Share Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-4 mb-8"
        data-ocid="portfolio.section"
      >
        {[
          {
            icon: <CheckCircle2 className="w-5 h-5" />,
            label: "Total Deliveries",
            value: deliveredJobs.length,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: <Weight className="w-5 h-5" />,
            label: "Total KG Transported",
            value: `${totalKg.toLocaleString()} kg`,
            color: "text-accent-foreground",
            bg: "bg-accent/40",
          },
          {
            icon: <Zap className="w-5 h-5" />,
            label: "Active Jobs",
            value: activeJobs.length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.06 }}
          >
            <Card className="border-border shadow-card text-center">
              <CardContent className="pt-5 pb-5 px-3">
                <div
                  className={`inline-flex p-2 rounded-xl mb-3 ${stat.bg} ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <p className={`text-xl font-display font-bold ${stat.color}`}>
                  {isLoading ? "—" : stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Delivery History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Delivery History
        </h2>

        {isLoading ? (
          <Card className="border-border" data-ocid="portfolio.loading_state">
            <CardContent className="p-10 text-center text-muted-foreground">
              <div className="w-6 h-6 mx-auto mb-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading deliveries...
            </CardContent>
          </Card>
        ) : deliveredJobs.length === 0 ? (
          <Card
            className="border-dashed border-2"
            data-ocid="portfolio.empty_state"
          >
            <CardContent className="p-12 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-display text-lg font-semibold text-foreground mb-1">
                No deliveries yet
              </p>
              <p className="text-sm text-muted-foreground">
                Complete your first delivery to build your portfolio.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => navigate({ to: "/driver" })}
                data-ocid="portfolio.primary_button"
              >
                Find Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-ocid="portfolio.list">
            {deliveredJobs.map((req, i) => (
              <motion.div
                key={`${req.cropType}-${req.timestamp.toString()}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.04 }}
                data-ocid={`portfolio.item.${i + 1}`}
              >
                <Card className="border-border shadow-card card-hover">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Crop icon + name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {req.cropType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {req.quantityKg.toString()} kg
                          </p>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 min-w-0">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{req.pickupLocation}</span>
                        <span className="shrink-0 mx-1">→</span>
                        <MapPin className="w-3 h-3 text-destructive shrink-0" />
                        <span className="truncate">{req.dropLocation}</span>
                      </div>

                      {/* Date + Price */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0.5 shrink-0">
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(req.estimatedPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(req.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
