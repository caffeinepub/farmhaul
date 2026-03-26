import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock,
  ExternalLink,
  Loader2,
  LocateFixed,
  MapPin,
  Package,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequestStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useVoiceCommand } from "../context/VoiceCommandContext";
import {
  useCreateTransportRequest,
  useDeleteRequest,
  useGetMyRequests,
} from "../hooks/useQueries";
import type { TranslationKey } from "../i18n/translations";

const CROP_TYPES: Array<{ value: string; key: TranslationKey }> = [
  { value: "Rice", key: "crop_rice" },
  { value: "Wheat", key: "crop_wheat" },
  { value: "Vegetables", key: "crop_vegetables" },
  { value: "Fruits", key: "crop_fruits" },
  { value: "Other", key: "crop_other" },
];

export function FarmerDashboard() {
  const { t } = useLang();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: myRequests, isLoading } = useGetMyRequests();
  const createRequest = useCreateTransportRequest();
  const deleteRequest = useDeleteRequest();
  const { registerFormFillers } = useVoiceCommand();

  const [cropType, setCropType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [time, setTime] = useState("");
  const [locating, setLocating] = useState(false);

  // Register form fillers with voice bot when this page is mounted
  useEffect(() => {
    registerFormFillers({ setCropType, setQuantity, setPickup, setDrop });
    return () => registerFormFillers(null);
  }, [registerFormFillers]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "FarmHaul/1.0" } },
          );
          const data = await res.json();
          setPickup(
            data.display_name ??
              `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          );
          toast.success("Location detected! 📍");
        } catch {
          toast.error("Could not reverse geocode location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Could not get location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const estimatedCost = quantity ? Number(quantity) * 2 + 50 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType || !quantity || !pickup || !drop || !time) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const scheduledTime =
        BigInt(new Date(time).getTime()) * BigInt(1_000_000);
      await createRequest.mutateAsync({
        cropType,
        quantityKg: BigInt(quantity),
        pickupLocation: pickup,
        dropLocation: drop,
        scheduledTime,
      });
      toast.success("Pickup request created! 🎉");
      setCropType("");
      setQuantity("");
      setPickup("");
      setDrop("");
      setTime("");
    } catch {
      toast.error("Failed to create request. Please try again.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, requestId: bigint) => {
    e.stopPropagation();
    try {
      await deleteRequest.mutateAsync(requestId);
      toast.success("Request deleted");
    } catch {
      toast.error("Failed to delete request.");
    }
  };

  const handleShare = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    const url = `${window.location.origin}/track/${i}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied! 📋");
      })
      .catch(() => {
        toast.error("Could not copy link.");
      });
  };

  if (!profile) {
    return (
      <div
        className="container mx-auto px-4 py-12 text-center"
        data-ocid="farmer.error_state"
      >
        <p className="text-muted-foreground mb-4">
          Please login to access the farmer dashboard.
        </p>
        <Button onClick={() => navigate({ to: "/login" })}>Login</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t("farmer_title")}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {profile.displayName}
              </span>{" "}
              👋
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="border-border shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  {t("farmer_new_request")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>{t("farmer_crop_type")}</Label>
                      <Select value={cropType} onValueChange={setCropType}>
                        <SelectTrigger data-ocid="farmer.select">
                          <SelectValue placeholder="Select crop..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_TYPES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {t(c.key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quantity">{t("farmer_quantity")}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 500"
                        data-ocid="farmer.input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pickup" className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {t("farmer_pickup")}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="pickup"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="e.g. Amritsar, Punjab"
                        data-ocid="farmer.input"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleUseMyLocation}
                        disabled={locating}
                        title="Use my current location"
                        data-ocid="farmer.secondary_button"
                        className="shrink-0"
                      >
                        {locating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LocateFixed className="w-4 h-4 text-primary" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drop" className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-destructive" />
                      {t("farmer_drop")}
                    </Label>
                    <Input
                      id="drop"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder="e.g. Ludhiana Mandi"
                      data-ocid="farmer.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {t("farmer_time")}
                    </Label>
                    <Input
                      id="time"
                      type="datetime-local"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      data-ocid="farmer.input"
                    />
                  </div>

                  {estimatedCost > 0 && (
                    <div className="bg-primary/8 border border-primary/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        {t("farmer_estimate")}
                      </p>
                      <p className="text-2xl font-display font-bold text-primary mt-1">
                        ₹{estimatedCost.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Based on {quantity}kg × ₹2 + ₹50 base fee
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold"
                    disabled={createRequest.isPending}
                    data-ocid="farmer.submit_button"
                  >
                    {createRequest.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("farmer_submitting")}
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        {t("farmer_submit")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* My Requests */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-foreground mb-3">
              {t("farmer_my_requests")}
            </h2>
            {isLoading ? (
              <div
                className="flex justify-center py-8"
                data-ocid="farmer.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !myRequests?.length ? (
              <Card
                className="border-dashed border-border"
                data-ocid="farmer.empty_state"
              >
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  {t("farmer_no_requests")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req, i) => (
                  <motion.div
                    key={`${req.cropType}-${req.timestamp.toString()}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`farmer.item.${i + 1}`}
                  >
                    <Card
                      className="border-border shadow-xs card-hover cursor-pointer"
                      onClick={() => navigate({ to: `/track/${i}` })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {req.cropType}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {req.quantityKg.toString()} kg
                            </p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground truncate">
                                {req.pickupLocation}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                onClick={(e) => handleShare(e, i)}
                                title="Share tracking link"
                                data-ocid={`farmer.secondary_button.${i + 1}`}
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </Button>
                              {req.status === RequestStatus.pending && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => handleDelete(e, req.id)}
                                  disabled={deleteRequest.isPending}
                                  title="Delete request"
                                  data-ocid={`farmer.delete_button.${i + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <StatusBadge status={req.status} />
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
