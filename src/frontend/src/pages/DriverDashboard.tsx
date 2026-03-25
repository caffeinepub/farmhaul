import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  NavigationOff,
  Package,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RequestStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import {
  useAcceptRequest,
  useGetAllRequests,
  useUpdateRequestStatus,
} from "../hooks/useQueries";

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

function getAcceptWindow(scheduledTimeNs: bigint): {
  canAccept: boolean;
  label: string;
} {
  const scheduledTimeMs = Number(scheduledTimeNs / BigInt(1_000_000));
  const diff = scheduledTimeMs - Date.now(); // positive = future, negative = past
  const TEN_MIN_MS = 10 * 60 * 1000;

  // Allow accept if within 10 minutes before OR any time after scheduled time
  if (diff <= TEN_MIN_MS) {
    return { canAccept: true, label: "Accept" };
  }

  // Still too early — show countdown until the 10-min window opens
  const totalSec = Math.floor((diff - TEN_MIN_MS) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const label = m > 0 ? `Opens in ${m}m ${s}s` : `Opens in ${s}s`;
  return { canAccept: false, label };
}

export function DriverDashboard() {
  const { t } = useLang();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: allRequests, isLoading } = useGetAllRequests();
  const acceptRequest = useAcceptRequest();
  const updateStatus = useUpdateRequestStatus();
  const [tick, setTick] = useState(0);

  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // suppress unused warning — tick is used to trigger re-renders
  void tick;

  if (!profile) {
    return (
      <div
        className="container mx-auto px-4 py-12 text-center"
        data-ocid="driver.error_state"
      >
        <p className="text-muted-foreground mb-4">
          Please login to access the driver dashboard.
        </p>
        <Button onClick={() => navigate({ to: "/login" })}>Login</Button>
      </div>
    );
  }

  const pendingRequests =
    allRequests?.filter((r) => r.status === RequestStatus.pending) ?? [];
  const myJobs =
    allRequests?.filter(
      (r) =>
        r.status === RequestStatus.accepted ||
        r.status === RequestStatus.pickedUp,
    ) ?? [];

  const handleAccept = async (requestId: bigint) => {
    try {
      await acceptRequest.mutateAsync(requestId);
      toast.success("Request accepted! 🚛");
    } catch {
      toast.error("Failed to accept request.");
    }
  };

  const handleUpdateStatus = async (
    requestId: bigint,
    status: RequestStatus,
  ) => {
    try {
      await updateStatus.mutateAsync({ requestId, status });
      toast.success(
        status === RequestStatus.pickedUp
          ? "Marked as picked up! 📦"
          : "Delivered! ✅",
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      setDriverLocation(null);
      toast("Location tracking stopped.");
    } else {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        return;
      }
      setIsTracking(true);
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { "User-Agent": "FarmHaul/1.0" } },
            );
            const data = await res.json();
            setDriverLocation({
              lat: latitude,
              lng: longitude,
              address:
                data.display_name ??
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            });
          } catch {
            setDriverLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            });
          }
        },
        () => {
          setIsTracking(false);
          toast.error("Could not get location. Please allow location access.");
        },
        { enableHighAccuracy: true },
      );
      watchIdRef.current = id;
      toast.success("📍 Location tracking started!");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("driver_title")}
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Welcome,{" "}
            <span className="font-medium text-foreground">
              {profile.displayName}
            </span>{" "}
            🚚
          </p>
        </div>

        <Tabs defaultValue="available">
          <TabsList className="mb-6" data-ocid="driver.tab">
            <TabsTrigger value="available" data-ocid="driver.tab">
              {t("driver_available")}
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="myjobs" data-ocid="driver.tab">
              {t("driver_my_jobs")}
              {myJobs.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {myJobs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              data-ocid="driver.tab"
              onClick={() => navigate({ to: "/driver/portfolio" })}
            >
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              My Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {isLoading ? (
              <div
                className="flex justify-center py-12"
                data-ocid="driver.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="border-dashed" data-ocid="driver.empty_state">
                <CardContent className="p-10 text-center text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  {t("driver_no_requests")}
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pendingRequests.map((req, i) => {
                  const { canAccept, label } = getAcceptWindow(
                    req.scheduledTime,
                  );
                  return (
                    <motion.div
                      key={`${req.cropType}-${req.timestamp.toString()}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-ocid={`driver.item.${i + 1}`}
                    >
                      <Card className="border-border shadow-card card-hover h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                {req.cropType}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {req.quantityKg.toString()} kg
                              </p>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {req.pickupLocation}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-destructive shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {req.dropLocation}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                              {formatTime(req.scheduledTime)}
                            </span>
                          </div>
                          <div className="pt-1 flex items-center justify-between">
                            <span className="font-semibold text-primary">
                              ₹{req.estimatedPrice.toString()}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(req.id)}
                                disabled={!canAccept || acceptRequest.isPending}
                                title={label}
                                data-ocid="driver.primary_button"
                                className={!canAccept ? "opacity-60" : ""}
                              >
                                {acceptRequest.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  t("driver_accept")
                                )}
                              </Button>
                              {!canAccept && (
                                <span className="text-xs text-muted-foreground font-medium">
                                  {label}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="myjobs">
            {myJobs.length === 0 ? (
              <Card className="border-dashed" data-ocid="driver.empty_state">
                <CardContent className="p-10 text-center text-muted-foreground">
                  {t("driver_no_jobs")}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Location tracking banner */}
                {isTracking && driverLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3"
                    data-ocid="driver.success_state"
                  >
                    <span className="text-base leading-none mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-0.5">
                        Live Location Active
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {driverLocation.address}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {myJobs.map((req, i) => (
                    <motion.div
                      key={`${req.cropType}-${req.timestamp.toString()}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-ocid={`driver.item.${i + 1}`}
                    >
                      <Card className="border-border shadow-card">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              {req.cropType}
                            </CardTitle>
                            <StatusBadge status={req.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {req.quantityKg.toString()} kg
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">
                              {req.pickupLocation}
                            </span>
                          </div>

                          {/* Track My Location toggle */}
                          <div className="pt-1">
                            <Button
                              size="sm"
                              variant={isTracking ? "default" : "outline"}
                              onClick={handleToggleTracking}
                              className={
                                isTracking
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : ""
                              }
                              data-ocid="driver.toggle"
                            >
                              {isTracking ? (
                                <>
                                  <NavigationOff className="w-3.5 h-3.5 mr-1.5" />
                                  Stop Tracking
                                </>
                              ) : (
                                <>
                                  <Navigation className="w-3.5 h-3.5 mr-1.5" />
                                  Track My Location
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Location pill under card */}
                          {isTracking && driverLocation && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5"
                            >
                              <span className="text-xs">📍</span>
                              <span className="text-xs text-green-700 dark:text-green-400 truncate">
                                {driverLocation.address}
                              </span>
                            </motion.div>
                          )}

                          <div
                            className="flex gap-2 pt-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {req.status === RequestStatus.accepted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUpdateStatus(
                                    req.id,
                                    RequestStatus.pickedUp,
                                  )
                                }
                                disabled={updateStatus.isPending}
                                className="flex-1"
                                data-ocid="driver.secondary_button"
                              >
                                {t("driver_pickup_done")}
                              </Button>
                            )}
                            {req.status === RequestStatus.pickedUp && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    req.id,
                                    RequestStatus.delivered,
                                  )
                                }
                                disabled={updateStatus.isPending}
                                className="flex-1"
                                data-ocid="driver.primary_button"
                              >
                                {t("driver_delivered")}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Portfolio tab has no content — it navigates away */}
          <TabsContent value="portfolio" />
        </Tabs>
      </motion.div>
    </main>
  );
}
