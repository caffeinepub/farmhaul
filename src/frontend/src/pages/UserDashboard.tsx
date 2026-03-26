import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  Fingerprint,
  LayoutDashboard,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ActivityRecord } from "../backend.d";
import { UserRole } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";

// ---- helpers ----------------------------------------------------------------

function nsToMs(ns: bigint): number {
  return Number(ns / 1_000_000n);
}

function relativeTime(ns: bigint): string {
  const ms = nsToMs(ns);
  const diff = Date.now() - ms;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function joinDate(ns: bigint): string {
  const date = new Date(nsToMs(ns));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const ACTION_LABELS: Record<string, string> = {
  createRequest: "New Transport Request",
  acceptRequest: "Accepted Job",
  updateRequestStatus: "Status Update",
  deleteRequest: "Deleted Request",
  registerUser: "Account Created",
  switchRole: "Role Changed",
};

function humanizeAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/([A-Z])/g, " $1").trim();
}

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

type FilterTab = "all" | "favorites" | "requests";

// ---- hooks ------------------------------------------------------------------

function useGetMyActivities() {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityRecord[]>({
    queryKey: ["myActivities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

function useGetUserCreatedAt() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint | null>({
    queryKey: ["userCreatedAt"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserCreatedAt();
    },
    enabled: !!actor && !isFetching,
  });
}

function useDeleteActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteActivity(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myActivities"] }),
  });
}

function useToggleFavorite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleFavorite(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myActivities"] }),
  });
}

function useClearAllActivities() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.clearAllActivities();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myActivities"] }),
  });
}

// ---- sub-components ---------------------------------------------------------

function ActivityCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </Card>
  );
}

interface ActivityCardProps {
  record: ActivityRecord;
  onToggleFavorite: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  favoriteLoading: boolean;
  deleteLoading: boolean;
}

function ActivityCard({
  record,
  onToggleFavorite,
  onDelete,
  favoriteLoading,
  deleteLoading,
}: ActivityCardProps) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRerun = () => {
    navigate({ to: "/farmer" });
    toast.info("Navigate to Farmer Dashboard to re-submit your request.");
  };

  return (
    <>
      <Card className="card-hover border-border/60" data-ocid="activity.item.1">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground truncate">
                {humanizeAction(record.action)}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {record.isFavorite && (
                <Badge variant="secondary" className="text-xs h-5">
                  &#9733; Saved
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {relativeTime(record.timestamp)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {record.inputData && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {record.inputData}
            </p>
          )}
          {record.outputData && (
            <Badge
              variant="outline"
              className="text-xs font-mono truncate max-w-full"
            >
              {record.outputData}
            </Badge>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                record.isFavorite
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-muted-foreground hover:text-amber-500"
              }`}
              onClick={() => onToggleFavorite(record.id)}
              disabled={favoriteLoading}
              aria-label="Toggle favorite"
              data-ocid="activity.toggle"
            >
              <Star
                className="w-4 h-4"
                fill={record.isFavorite ? "currentColor" : "none"}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={deleteLoading}
              aria-label="Delete activity"
              data-ocid="activity.delete_button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {record.action === "createRequest" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs ml-auto"
                onClick={handleRerun}
                data-ocid="activity.secondary_button"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Re-run
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent data-ocid="activity.dialog">
          <DialogHeader>
            <DialogTitle>Delete Activity?</DialogTitle>
            <DialogDescription>
              This will permanently remove this activity record. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              data-ocid="activity.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(record.id);
                setConfirmDelete(false);
              }}
              data-ocid="activity.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---- main page --------------------------------------------------------------

export function UserDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: activities = [], isLoading: activitiesLoading } =
    useGetMyActivities();
  const { data: createdAt } = useGetUserCreatedAt();

  const deleteMutation = useDeleteActivity();
  const favoriteMutation = useToggleFavorite();
  const clearMutation = useClearAllActivities();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const totalActivities = activities.length;
  const favoritesCount = activities.filter((a) => a.isFavorite).length;
  const requestsCount = activities.filter((a) =>
    a.action.toLowerCase().includes("request"),
  ).length;

  const filtered = useMemo(() => {
    let list = activities;
    if (activeTab === "favorites") list = list.filter((a) => a.isFavorite);
    if (activeTab === "requests")
      list = list.filter((a) => a.action.toLowerCase().includes("request"));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          a.inputData.toLowerCase().includes(q) ||
          a.outputData.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activities, activeTab, search]);

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">
            Sign in to view your dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Connect with Internet Identity to see your activity history.
          </p>
          <Button
            onClick={() => navigate({ to: "/login" })}
            data-ocid="dashboard.primary_button"
          >
            Sign In
          </Button>
        </div>
      </main>
    );
  }

  const initials = profile.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = (id: bigint) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Activity deleted"),
      onError: () => toast.error("Failed to delete"),
    });
  };

  const handleFavorite = (id: bigint) => {
    favoriteMutation.mutate(id, {
      onError: () => toast.error("Failed to update favorite"),
    });
  };

  const handleClearAll = () => {
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All activities cleared");
        setConfirmClear(false);
      },
      onError: () => toast.error("Failed to clear activities"),
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Activity history &amp; profile
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 border-border/60" data-ocid="dashboard.card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.displayName}
                </h2>
                <Badge
                  className={`capitalize text-xs ${
                    profile.role === UserRole.driver
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : "bg-green-100 text-green-700 border-green-200"
                  }`}
                  variant="outline"
                >
                  {profile.role === UserRole.driver ? (
                    <>
                      <Truck className="w-3 h-3 mr-1" />
                      Driver
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Farmer
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {createdAt && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Joined {joinDate(createdAt)}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Fingerprint className="w-3.5 h-3.5" />
                  ICP Identity
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/40">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalActivities}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Activity className="w-3 h-3" /> Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {favoritesCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3 h-3" /> Favorites
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {requestsCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Truck className="w-3 h-3" /> Requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Activity History
          </h3>
          {activities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
              onClick={() => setConfirmClear(true)}
              data-ocid="dashboard.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="dashboard.search_input"
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FilterTab)}
          >
            <TabsList className="h-10">
              <TabsTrigger value="all" data-ocid="dashboard.tab">
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" data-ocid="dashboard.tab">
                &#9733; Favorites
              </TabsTrigger>
              <TabsTrigger value="requests" data-ocid="dashboard.tab">
                Requests
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Cards */}
        {activitiesLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-ocid="dashboard.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <ActivityCardSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" data-ocid="dashboard.empty_state">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              {search || activeTab !== "all" ? (
                <XCircle className="w-8 h-8 text-muted-foreground" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <p className="text-base font-medium text-foreground">
              {search || activeTab !== "all"
                ? "No matching activities"
                : "No activity yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || activeTab !== "all"
                ? "Try adjusting your search or filter."
                : "Start by creating a transport request."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((record) => (
              <ActivityCard
                key={record.id.toString()}
                record={record}
                onToggleFavorite={handleFavorite}
                onDelete={handleDelete}
                favoriteLoading={
                  favoriteMutation.isPending &&
                  favoriteMutation.variables === record.id
                }
                deleteLoading={
                  deleteMutation.isPending &&
                  deleteMutation.variables === record.id
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent data-ocid="dashboard.dialog">
          <DialogHeader>
            <DialogTitle>Clear All Activities?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your activity history. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmClear(false)}
              data-ocid="dashboard.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearMutation.isPending}
              data-ocid="dashboard.confirm_button"
            >
              {clearMutation.isPending ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
