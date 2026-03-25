import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Leaf, Loader2, ShieldCheck, Tractor, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { t } = useLang();
  const { actor } = useActor();
  const { refreshProfile } = useAuth();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.farmer);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!actor) {
      toast.error("Connecting to blockchain, please wait...");
      return;
    }
    setLoading(true);
    try {
      await actor.registerUser(name.trim(), role);
      await refreshProfile();
      toast.success(`Welcome, ${name}! 🌾`);
      navigate({ to: role === UserRole.farmer ? "/farmer" : "/driver" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already registered")) {
        await refreshProfile();
        navigate({ to: role === UserRole.farmer ? "/farmer" : "/driver" });
      } else {
        toast.error("Registration failed. Please try again.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("auth_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("auth_subtitle")}</p>
        </div>

        {!isAuthenticated ? (
          /* Step 1: Connect with Internet Identity */
          <Card className="border-border shadow-card" data-ocid="login.modal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Connect Your Identity</CardTitle>
              <CardDescription>
                Sign in securely with Internet Identity to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full h-11 font-semibold"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="login.submit_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Connect with Internet Identity
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Internet Identity keeps your account secure and private.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Step 2: Register profile */
          <Card className="border-border shadow-card" data-ocid="login.modal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t("auth_title")}</CardTitle>
              <CardDescription>{t("auth_subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("auth_name_label")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth_name_placeholder")}
                    disabled={loading}
                    data-ocid="login.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("auth_role_label")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.farmer)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.farmer
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                      data-ocid="login.radio"
                    >
                      <Tractor className="w-7 h-7" />
                      <span className="text-sm font-semibold">
                        {t("auth_role_farmer")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.driver)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.driver
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                      data-ocid="login.radio"
                    >
                      <Truck className="w-7 h-7" />
                      <span className="text-sm font-semibold">
                        {t("auth_role_driver")}
                      </span>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={loading}
                  data-ocid="login.submit_button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth_logging_in")}
                    </>
                  ) : (
                    t("auth_submit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </main>
  );
}
