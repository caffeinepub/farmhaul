import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Leaf, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { t, toggleLang } = useLang();
  const { profile } = useAuth();
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    profile?.role === UserRole.driver ? "/driver" : "/farmer";

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  const navLinks = [
    { label: t("nav_home"), to: "/" },
    { label: t("nav_dashboard"), to: dashboardPath },
    { label: t("nav_track"), to: "/track" },
    { label: t("nav_stats"), to: "/stats" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            FarmHaul
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{
                className:
                  "px-3 py-2 rounded-lg text-sm font-medium text-primary bg-secondary",
              }}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {profile && (
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
              activeProps={{
                className:
                  "px-3 py-2 rounded-lg text-sm font-medium text-primary bg-secondary flex items-center gap-1.5",
              }}
              data-ocid="nav.link"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My History
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="text-xs font-medium"
            data-ocid="nav.toggle"
          >
            {t("nav_lang")}
          </Button>
          {profile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-ocid="nav.logout_button"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {t("nav_logout")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="nav.login_button"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              {t("nav_login")}
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {profile && (
            <Link
              to="/dashboard"
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.link"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My History
            </Link>
          )}
          <div className="flex gap-2 pt-2 border-t border-border mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="flex-1 text-xs"
              data-ocid="nav.toggle"
            >
              {t("nav_lang")}
            </Button>
            {profile ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex-1"
                data-ocid="nav.logout_button"
              >
                {t("nav_logout")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate({ to: "/login" })}
                className="flex-1"
                data-ocid="nav.login_button"
              >
                {t("nav_login")}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
