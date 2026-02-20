import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Leaf, Coffee, UtensilsCrossed, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary" />
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-[var(--organic-warm)]" />
          <div className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full bg-primary" />
        </div>

        <div className="container mx-auto px-4 pt-12 pb-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-primary tracking-widest uppercase">
                Organic In The Box
              </span>
              <Leaf className="w-8 h-8 text-primary" />
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Order in English
            </h1>

            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-2">
              Practice your English while ordering real food from our garden café
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-primary/70 mb-8">
              <Coffee className="w-4 h-4" />
              <span>InFlux Jundiaí × Organic In The Box</span>
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </motion.div>

          {/* English Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="max-w-lg mx-auto mb-8 border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span> Useful phrases for ordering:
                </h3>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium shrink-0">"</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">I'd like</strong> a cappuccino, please.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium shrink-0">"</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Can I have</strong> the avocado toast?
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium shrink-0">"</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Could I get</strong> a fresh orange juice?
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium shrink-0">"</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">I'll have</strong> the burger, please.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
              onClick={() => navigate("/order")}
            >
              <QrCode className="w-5 h-5 mr-2" />
              Start Ordering
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Scan the QR code on your table or tap the button above
            </p>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div className="container mx-auto px-4 py-12">
        <h2
          className="text-2xl font-bold text-center mb-8 text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          How does it work?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              step: "1",
              title: "Browse the Menu",
              desc: "Explore our menu in English. Read descriptions and choose what you'd like.",
              icon: "📖",
            },
            {
              step: "2",
              title: "Place Your Order",
              desc: "Add items to your cart and confirm your order — all in English!",
              icon: "🛒",
            },
            {
              step: "3",
              title: "Enjoy Your Food",
              desc: "We'll prepare your order and bring it to your table in the garden.",
              icon: "🍽️",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
            >
              <Card className="text-center border-border/50 hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="text-xs font-bold text-primary mb-1">
                    STEP {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Leaf className="w-4 h-4 text-primary/50" />
          <span>Organic In The Box — Your 100% healthy café</span>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Rua do Retiro, 940 — Parque do Colégio, Jundiaí
        </p>
      </footer>
    </div>
  );
}
