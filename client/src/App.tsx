import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ImAIndEntry from "./pages/ImAIndEntry";
import OrderPage from "./pages/OrderPage";
import OrderStatus from "./pages/OrderStatus";
import AdminDashboard from "./pages/AdminDashboard";
import QRCodes from "./pages/QRCodes";
import PhraseBuilder from "./pages/PhraseBuilder";
import VoiceOrder from "./pages/VoiceOrder";
import QASimulation from "./pages/QASimulation";
import Leaderboard from "./pages/Leaderboard";
import AdminSettings from "./pages/AdminSettings";
import RestaurantExperience from "./pages/RestaurantExperience";
import TopDogExperience from "./pages/TopDogExperience";
import LaGuapaExperience from "./pages/LaGuapaExperience";
import ElPatronExperience from "./pages/ElPatronExperience";
import CabanaBurgerExperience from "./pages/CabanaBurgerExperience";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./pages/PartnerDashboard";
import MasterDashboard from "./pages/MasterDashboard";
import PartnerQRCodes from "./pages/PartnerQRCodes";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={ImAIndEntry} />
      <Route path={"/organic"} component={Home} />
      <Route path={"/order"} component={OrderPage} />
      <Route path={"/order/status/:id"} component={OrderStatus} />
      <Route path={"/game/phrase-builder"} component={PhraseBuilder} />
      <Route path={"/game/voice-order"} component={VoiceOrder} />
      <Route path={"/game/qa-simulation"} component={QASimulation} />
      <Route path={"/game/leaderboard"} component={Leaderboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/qrcodes"} component={QRCodes} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/restaurant/:slug"} component={RestaurantExperience} />
      <Route path={"/topdog"} component={TopDogExperience} />
      <Route path={"/laguapa"} component={LaGuapaExperience} />
      <Route path={"/elpatron"} component={ElPatronExperience} />
      <Route path={"/cabana"} component={CabanaBurgerExperience} />
      <Route path={"/partner/login"} component={PartnerLogin} />
      <Route path={"/partner/dashboard"} component={PartnerDashboard} />
      <Route path={"/partner/qrcodes"} component={PartnerQRCodes} />
      <Route path={"/master"} component={MasterDashboard} />
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
