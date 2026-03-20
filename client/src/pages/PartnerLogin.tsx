import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PartnerLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.partner.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("partner_token", data.token);
      localStorage.setItem("partner_user", JSON.stringify(data.user));
      localStorage.setItem("partner_restaurant", JSON.stringify(data.restaurant));
      if (data.user.role === "master") {
        navigate("/master");
      } else {
        navigate("/partner/dashboard");
      }
    },
    onError: (err) => {
      setError("Usuário ou senha inválidos. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ImAInd</h1>
              <p className="text-xs text-blue-400 tracking-widest uppercase">Restaurant Experience</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Acesso exclusivo para parceiros</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <h2 className="text-white text-xl font-semibold text-center">Entrar no Dashboard</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Usuário</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: topdog"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Entrando...
                  </span>
                ) : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                ← Voltar para o app
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-xs mt-6">
          ImAInd Restaurant Experience · Acesso restrito a parceiros
        </p>
      </div>
    </div>
  );
}
