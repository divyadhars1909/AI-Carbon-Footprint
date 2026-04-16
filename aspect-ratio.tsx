import { Lightbulb, Car, Zap, Utensils, Trash2, ArrowRight } from "lucide-react";
import { type Emission } from "@shared/schema";
import { motion } from "framer-motion";

export function RecommendationCard({ emission }: { emission: Emission }) {
  // Find highest emission category
  const categories = [
    { name: "Transport", value: emission.transportEmission, icon: Car, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Electricity", value: emission.electricityEmission, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Food", value: emission.foodEmission, icon: Utensils, color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Waste", value: emission.wasteEmission, icon: Trash2, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const highest = categories.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current
  );

  const getRecommendation = (category: string) => {
    switch (category) {
      case "Transport":
        return {
          title: "Optimize Your Commute",
          desc: "Your transport emissions are highest. Consider carpooling, switching to public transit, or biking for short trips to significantly reduce your footprint.",
          action: "Explore transit options"
        };
      case "Electricity":
        return {
          title: "Energy Efficiency",
          desc: "Electricity usage is your biggest contributor. Switch to LED bulbs, unplug unused electronics, and consider a smart thermostat.",
          action: "View energy tips"
        };
      case "Food":
        return {
          title: "Plant-Based Choices",
          desc: "Diet contributes most to your footprint. Incorporating more plant-based meals and reducing red meat can make a massive environmental impact.",
          action: "Try meatless recipes"
        };
      case "Waste":
        return {
          title: "Reduce, Reuse, Recycle",
          desc: "Waste generation is high. Focus on composting organic matter and avoiding single-use plastics to lower this metric.",
          action: "Start composting"
        };
      default:
        return { title: "Keep it up!", desc: "You're doing great.", action: "Learn more" };
    }
  };

  const rec = getRecommendation(highest.name);
  const Icon = highest.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl p-6 border border-primary/20 relative overflow-hidden"
    >
      <div className="absolute -right-6 -top-6 text-primary/10">
        <Lightbulb className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${highest.bg} ${highest.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Priority: {highest.name}</h3>
            <h4 className="text-xl font-display font-bold text-foreground">{rec.title}</h4>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          {rec.desc}
        </p>
        
        <button className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors group">
          {rec.action}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
