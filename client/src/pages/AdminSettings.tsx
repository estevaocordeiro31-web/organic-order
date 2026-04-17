import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  ArrowLeft, Loader2, Save, CreditCard, MessageSquare, Webhook, Settings,
} from "lucide-react";
import { useLocation } from "wouter";

type SettingItem = { id: number; settingKey: string; settingValue: string | null };

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const { data: settings, refetch: refetchSettings, isLoading: settingsLoading } = trpc.admin.getSettings.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateSettingMutation = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      refetchSettings();
      toast.success("Setting saved!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [pixKey, setPixKey] = useState("");
  const [pixName, setPixName] = useState("");
  const [pixCity, setPixCity] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (settings) {
      const getVal = (key: string) => settings.find((s: SettingItem) => s.settingKey === key)?.settingValue || "";
      setPixKey(getVal("pix_key"));
      setPixName(getVal("pix_name"));
      setPixCity(getVal("pix_city"));
      setWhatsappNumber(getVal("whatsapp_number"));
      setWebhookUrl(getVal("webhook_url"));
    }
  }, [settings]);

  const saveSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Settings</h1>
            <p className="text-muted-foreground mb-6">Sign in as admin to manage settings</p>
            <Button size="lg" className="w-full" onClick={() => { window.location.href = getLoginUrl(); }}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Settings
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Pix Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              Pix Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pix Key (Chave Pix)</label>
              <div className="flex gap-2">
                <Input
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, CNPJ, email, phone or random key"
                />
                <Button size="sm" onClick={() => saveSetting("pix_key", pixKey)} disabled={updateSettingMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Beneficiary Name</label>
              <div className="flex gap-2">
                <Input
                  value={pixName}
                  onChange={(e) => setPixName(e.target.value)}
                  placeholder="ImAInd Restaurant Experience"
                />
                <Button size="sm" onClick={() => saveSetting("pix_name", pixName)} disabled={updateSettingMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">City</label>
              <div className="flex gap-2">
                <Input
                  value={pixCity}
                  onChange={(e) => setPixCity(e.target.value)}
                  placeholder="Jundiaí"
                />
                <Button size="sm" onClick={() => saveSetting("pix_city", pixCity)} disabled={updateSettingMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-green-400" />
              WhatsApp Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">WhatsApp Number (with country code)</label>
              <div className="flex gap-2">
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="5511947515284"
                />
                <Button size="sm" onClick={() => saveSetting("whatsapp_number", whatsappNumber)} disabled={updateSettingMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Format: country code + area code + number (no spaces or dashes)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Webhook className="w-5 h-5 text-blue-600" />
              Webhook Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Webhook URL (optional)</label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.z-api.io/instances/..."
                />
                <Button size="sm" onClick={() => saveSetting("webhook_url", webhookUrl)} disabled={updateSettingMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                When set, order notifications will be sent to this URL via POST with order data.
                Compatible with Z-API, Evolution API, WPPConnect, or any webhook receiver.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
