import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Leaf, QrCode, Loader2, ArrowLeft, Printer } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";

export default function QRCodes() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { data: tables } = trpc.menu.tables.useQuery();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              QR Code Generator
            </h1>
            <p className="text-muted-foreground mb-6">Sign in to generate QR codes for tables</p>
            <Button size="lg" className="w-full" onClick={() => { window.location.href = getLoginUrl(); }}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Admin access required.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print QR Codes
          </Button>
        </div>

        <div className="text-center mb-8 print:mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Table QR Codes
            </h1>
          </div>
          <p className="text-sm text-muted-foreground print:hidden">
            Print these and place them on each table in the garden
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-2 print:gap-8">
          {tables?.map((table) => {
            const orderUrl = `${baseUrl}/order?table=${table.id}`;
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderUrl)}`;

            return (
              <Card key={table.id} className="print:border-2 print:border-black print:shadow-none">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Leaf className="w-4 h-4 text-primary print:text-black" />
                    <span className="text-xs font-medium text-primary print:text-black uppercase tracking-wider">
                      Organic In The Box
                    </span>
                    {/* Note: This QR page is specific to the Organic partner */}
                  </div>

                  <div className="bg-white p-2 rounded-lg inline-block mb-2">
                    <img
                      src={qrApiUrl}
                      alt={`QR Code for Table ${table.number}`}
                      className="w-40 h-40 mx-auto"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-2xl font-bold text-foreground print:text-black mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Table {table.number}
                  </div>

                  <p className="text-xs text-muted-foreground print:text-gray-600">
                    Scan to order in English
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 print:text-gray-400 mt-1">
                    InFlux Jundiaí × Organic
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
