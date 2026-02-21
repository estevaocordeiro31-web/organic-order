import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import OrderStatus from "./pages/OrderStatus";
import AdminDashboard from "./pages/AdminDashboard";
import QRCodes from "./pages/QRCodes";
import PhraseBuilder from "./pages/PhraseBuilder";
import VoiceOrder from "./pages/VoiceOrder";
import QASimulation from "./pages/QASimulation";
import Leaderboard from "./pages/Leaderboard";
import AdminSettings from "./pages/AdminSettings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/order"} component={OrderPage} />
      <Route path={"/order/status/:id"} component={OrderStatus} />
      <Route path={"/game/phrase-builder"} component={PhraseBuilder} />
      <Route path={"/game/voice-order"} component={VoiceOrder} />
      <Route path={"/game/qa-simulation"} component={QASimulation} />
      <Route path={"/game/leaderboard"} component={Leaderboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/qrcodes"} component={QRCodes} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
