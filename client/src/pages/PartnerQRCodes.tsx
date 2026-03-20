import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QRCode from "qrcode";

const RESTAURANT_CONFIGS: Record<string, {
  tables: number;
  color: string;
  bgColor: string;
  icon: string;
  path: string;
}> = {
  organic:  { tables: 8,  color: "#4ade80", bgColor: "#052e16", icon: "🌿", path: "/organic" },
  topdog:   { tables: 8,  color: "#ef4444", bgColor: "#1a0000", icon: "🌭", path: "/topdog" },
  laguapa:  { tables: 6,  color: "#f59e0b", bgColor: "#1a1000", icon: "🥟", path: "/laguapa" },
  elpatron: { tables: 10, color: "#f97316", bgColor: "#1a0800", icon: "🌮", path: "/elpatron" },
};

function QRCodeCanvas({ url, color, size = 180 }: { url: string; color: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).catch(console.error);
  }, [url, size]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

function usePartnerAuth() {
  const [, navigate] = useLocation();
  const token = localStorage.getItem("partner_token");
  const user = JSON.parse(localStorage.getItem("partner_user") || "null");
  const restaurant = JSON.parse(localStorage.getItem("partner_restaurant") || "null");

  useEffect(() => {
    if (!token || !user) navigate("/partner/login");
  }, [token, user]);

  return { token, user, restaurant };
}

export default function PartnerQRCodes() {
  const [, navigate] = useLocation();
  const { token, user, restaurant } = usePartnerAuth();
  const [selectedLang, setSelectedLang] = useState<"en" | "es">("en");

  if (!token || !user || !restaurant) return null;

  const slug = restaurant.slug || "organic";
  const config = RESTAURANT_CONFIGS[slug] || RESTAURANT_CONFIGS.organic;
  const baseUrl = window.location.origin;

  const tables = Array.from({ length: config.tables }, (_, i) => i + 1);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: config.bgColor }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h1 className="font-bold text-white text-sm">{restaurant.name}</h1>
              <p className="text-xs text-gray-400">QR Codes por Mesa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              <button
                onClick={() => setSelectedLang("en")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${selectedLang === "en" ? "text-black" : "text-gray-400 hover:text-white"}`}
                style={{ backgroundColor: selectedLang === "en" ? config.color : "transparent" }}
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setSelectedLang("es")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${selectedLang === "es" ? "text-black" : "text-gray-400 hover:text-white"}`}
                style={{ backgroundColor: selectedLang === "es" ? config.color : "transparent" }}
              >
                🇪🇸 ES
              </button>
            </div>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-black text-xs font-semibold"
              style={{ backgroundColor: config.color }}
            >
              🖨️ Imprimir
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => navigate("/partner/dashboard")}
              className="text-gray-400 hover:text-white text-xs"
            >
              ← Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8 print:hidden">
          <h2 className="text-2xl font-bold text-white mb-2">
            {config.icon} QR Codes — {restaurant.name}
          </h2>
          <p className="text-gray-400 text-sm">
            Imprima e coloque um em cada mesa. Os clientes escaneiam e acessam a experiência em{" "}
            <span style={{ color: config.color }}>inglês</span> ou <span style={{ color: config.color }}>espanhol</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((tableNum) => {
            const url = `${baseUrl}${config.path}?table=${tableNum}&lang=${selectedLang}&voice=false`;
            return (
              <Card
                key={tableNum}
                className="border-white/10 text-center overflow-hidden"
                style={{ backgroundColor: `${config.color}10`, borderColor: `${config.color}30` }}
              >
                <CardContent className="p-4">
                  {/* Restaurant name */}
                  <p className="text-xs font-bold mb-1" style={{ color: config.color }}>
                    {config.icon} {restaurant.name}
                  </p>

                  {/* Table number */}
                  <div
                    className="text-3xl font-black mb-3"
                    style={{ color: config.color }}
                  >
                    Mesa {tableNum}
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-3">
                    <QRCodeCanvas url={url} color={config.color} size={150} />
                  </div>

                  {/* Language badge */}
                  <div
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-black mb-2"
                    style={{ backgroundColor: config.color }}
                  >
                    {selectedLang === "en" ? "🇺🇸 English" : "🇪🇸 Español"}
                  </div>

                  {/* Tagline */}
                  <p className="text-gray-400 text-xs leading-tight">
                    {selectedLang === "en"
                      ? "Scan & practice your English!"
                      : "¡Escanea y practica tu español!"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body { background: white !important; }
            .print\\:hidden { display: none !important; }
            .grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
