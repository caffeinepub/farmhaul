import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Leaf,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useGetStats } from "../hooks/useQueries";

const features = [
  {
    icon: Zap,
    title: "Fast Matching",
    titleHi: "तेज़ मिलान",
    desc: "Get matched with nearby drivers within minutes",
    descHi: "मिनटों में नजदीकी ड्राइवरों से जुड़ें",
  },
  {
    icon: ShieldCheck,
    title: "Verified Drivers",
    titleHi: "सत्यापित ड्राइवर",
    desc: "All drivers are verified and rated by farmers",
    descHi: "सभी ड्राइवर सत्यापित और किसानों द्वारा रेटेड हैं",
  },
  {
    icon: TrendingUp,
    title: "Fair Pricing",
    titleHi: "उचित मूल्य",
    desc: "Transparent price calculator based on distance and weight",
    descHi: "दूरी और वजन के आधार पर पारदर्शी मूल्य कैलकुलेटर",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { data: stats } = useGetStats();
  const { profile } = useAuth();

  const handleFarmerCTA = () => {
    if (profile) {
      navigate({ to: "/farmer" });
    } else {
      navigate({ to: "/login", search: { intent: "farmer" } });
    }
  };

  const handleDriverCTA = () => {
    if (profile) {
      navigate({ to: "/driver" });
    } else {
      navigate({ to: "/login", search: { intent: "driver" } });
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-20 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              <span>Uber for Farm Transport</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-3">
              {t("hero_tagline")}
            </h1>
            <p className="text-2xl md:text-3xl font-display text-white/75 mb-6">
              {t("hero_tagline_hi")}
            </p>
            <p className="text-lg text-white/80 max-w-xl mb-10 leading-relaxed">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleFarmerCTA}
                className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 h-12 shadow-lg"
                data-ocid="home.primary_button"
              >
                <Package className="w-5 h-5 mr-2" />
                {t("hero_cta_farmer")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDriverCTA}
                className="border-white/50 text-white bg-white/10 hover:bg-white/20 font-semibold text-base px-8 h-12"
                data-ocid="home.secondary_button"
              >
                <Truck className="w-5 h-5 mr-2" />
                {t("hero_cta_driver")}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats band */}
        <div className="bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: t("stat_deliveries"),
                  value: stats?.totalDelivered?.toString() ?? "1,240+",
                  icon: Package,
                },
                {
                  label: t("stat_farmers"),
                  value: stats?.totalFarmers?.toString() ?? "850+",
                  icon: Users,
                },
                {
                  label: t("stat_drivers"),
                  value: stats?.totalDrivers?.toString() ?? "320+",
                  icon: Truck,
                },
                {
                  label: t("stat_requests"),
                  value: stats?.totalRequests?.toString() ?? "3,600+",
                  icon: TrendingUp,
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl font-display font-bold text-white">
                    {s.value}
                  </p>
                  <p className="text-sm text-white/70">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            {lang === "en" ? "How FarmHaul Works" : "FarmHaul कैसे काम करता है"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {lang === "en"
              ? "Three simple steps to get your harvest moving"
              : "आपकी फसल को आगे बढ़ाने के लिए तीन आसान कदम"}
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: lang === "en" ? "Post Your Request" : "अनुरोध पोस्ट करें",
              desc:
                lang === "en"
                  ? "Enter crop type, quantity, pickup and drop locations"
                  : "फसल का प्रकार, मात्रा, पिकअप और ड्रॉप स्थान दर्ज करें",
            },
            {
              step: "02",
              title: lang === "en" ? "Driver Accepts" : "ड्राइवर स्वीकार करता है",
              desc:
                lang === "en"
                  ? "A nearby driver sees your request and accepts it"
                  : "एक नजदीकी ड्राइवर आपका अनुरोध देखता है और स्वीकार करता है",
            },
            {
              step: "03",
              title: lang === "en" ? "Delivered!" : "डिलीवर!",
              desc:
                lang === "en"
                  ? "Track in real-time as your crops reach the market"
                  : "जैसे ही आपकी फसल बाजार पहुँचे, रियल-टाइम ट्रैक करें",
            },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="card-hover border-border shadow-card h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="font-display font-bold text-primary text-lg">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 bg-card shadow-card h-full">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">
                      {lang === "en" ? f.title : f.titleHi}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === "en" ? f.desc : f.descHi}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
