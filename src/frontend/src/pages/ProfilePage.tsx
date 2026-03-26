import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  Fingerprint,
  Loader2,
  Pencil,
  Tractor,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";

function nsToMs(ns: bigint): number {
  return Number(ns / 1_000_000n);
}

function formatJoinDate(ns: bigint): string {
  return new Date(nsToMs(ns)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { actor } = useActor();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { data: createdAt, isLoading: createdAtLoading } = useQuery<
    bigint | null
  >({
    queryKey: ["userCreatedAt"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserCreatedAt();
    },
    enabled: !!actor && !!profile,
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      await actor.updateDisplayName(name);
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Name updated! ✅");
      setEditing(false);
    },
    onError: () => toast.error("Failed to update name"),
  });

  const switchRoleMutation = useMutation({
    mutationFn: async (newRole: UserRole) => {
      if (!actor) throw new Error("No actor");
      await actor.switchRole(newRole);
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Role updated! ✅");
    },
    onError: () => toast.error("Failed to switch role"),
  });

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-sm mx-auto space-y-4" data-ocid="profile.card">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">
            Sign in to view your profile
          </h2>
          <p className="text-muted-foreground text-sm">
            Connect with Internet Identity to manage your profile.
          </p>
          <Button
            onClick={() => navigate({ to: "/login" })}
            data-ocid="profile.primary_button"
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

  const handleStartEdit = () => {
    setNameInput(profile.displayName);
    setEditing(true);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    updateNameMutation.mutate(trimmed);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setNameInput("");
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your identity and role
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border-border/60 mb-6" data-ocid="profile.card">
        <CardContent className="p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="w-20 h-20 border-2 border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Name row */}
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-9 text-base font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    data-ocid="profile.input"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleSaveName}
                    disabled={updateNameMutation.isPending}
                    data-ocid="profile.save_button"
                  >
                    {updateNameMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={handleCancelEdit}
                    data-ocid="profile.cancel_button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {profile.displayName}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={handleStartEdit}
                    data-ocid="profile.edit_button"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {createdAtLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : createdAt ? (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Joined {formatJoinDate(createdAt)}
                  </span>
                ) : null}
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Fingerprint className="w-3.5 h-3.5" />
                  ICP Identity
                </span>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="border-t border-border/40 pt-5">
            <p className="text-sm font-medium text-foreground mb-3">
              Your Role
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  profile.role !== UserRole.farmer &&
                  switchRoleMutation.mutate(UserRole.farmer)
                }
                disabled={switchRoleMutation.isPending}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  profile.role === UserRole.farmer
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
                data-ocid="profile.toggle"
              >
                {switchRoleMutation.isPending &&
                profile.role !== UserRole.farmer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Tractor className="w-4 h-4" />
                )}
                Farmer
                {profile.role === UserRole.farmer && (
                  <Badge className="ml-1 text-xs h-5 bg-primary text-primary-foreground">
                    Active
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  profile.role !== UserRole.driver &&
                  switchRoleMutation.mutate(UserRole.driver)
                }
                disabled={switchRoleMutation.isPending}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  profile.role === UserRole.driver
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
                data-ocid="profile.toggle"
              >
                {switchRoleMutation.isPending &&
                profile.role !== UserRole.driver ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                Driver
                {profile.role === UserRole.driver && (
                  <Badge className="ml-1 text-xs h-5 bg-primary text-primary-foreground">
                    Active
                  </Badge>
                )}
              </button>
            </div>
            {switchRoleMutation.isPending && (
              <p
                className="text-xs text-muted-foreground mt-2 flex items-center gap-1"
                data-ocid="profile.loading_state"
              >
                <Loader2 className="w-3 h-3 animate-spin" /> Switching role...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
