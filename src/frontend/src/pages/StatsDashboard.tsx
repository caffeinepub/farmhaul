import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Loader2, Package, TrendingUp, Truck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useLang } from "../context/LangContext";
import { useGetStats } from "../hooks/useQueries";

const statCards = [
  {
    icon: Package,
    key: "stat_deliveries" as const,
    valueKey: "totalDelivered" as const,
    color: "text-primary",
    bg: "bg-primary/10",
    defaultVal: "1,240",
  },
  {
    icon: TrendingUp,
    key: "stat_requests" as const,
    valueKey: "totalRequests" as const,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    defaultVal: "3,680",
  },
  {
    icon: Users,
    key: "stat_farmers" as const,
    valueKey: "totalFarmers" as const,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    defaultVal: "850",
  },
  {
    icon: Truck,
    key: "stat_drivers" as const,
    valueKey: "totalDrivers" as const,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    defaultVal: "320",
  },
];

export function StatsDashboard() {
  const { t } = useLang();
  const { data: stats, isLoading } = useGetStats();

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            FarmHaul Impact
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Every delivery saves food from going to waste. Together, we’re
            building a stronger agricultural supply chain across India.
          </p>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="stats.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                data-ocid="stats.card"
              >
                <Card className="border-border shadow-card card-hover">
                  <CardContent className="p-6">
                    <div
                      className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4`}
                    >
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p
                      className={`text-3xl font-display font-bold ${card.color}`}
                    >
                      {stats
                        ? stats[card.valueKey].toString()
                        : card.defaultVal}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(card.key)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="border-0 bg-primary/8 shadow-none">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Reducing Food Loss Across India
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  India loses approximately ₹92,000 crore worth of food annually
                  due to poor supply chain infrastructure. FarmHaul connects
                  farmers directly with verified transport drivers, cutting
                  post-harvest losses by up to 30% and ensuring more food
                  reaches markets fresh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
