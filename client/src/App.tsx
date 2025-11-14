import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PropertyHome from "./pages/PropertyHome";
import Properties from "./pages/PropertiesNew";
import PropertyDetail from "./pages/PropertyDetail";
import GetStarted from "./pages/GetStarted";
import Success from "./pages/Success";
import Compliance from "./pages/Compliance";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PropertyVerification from "./pages/admin/PropertyVerification";
import AgentAds from "./pages/admin/AgentAds";
import Advertise from "./pages/Advertise";
import HelpCenter from "./pages/HelpCenter";
import Research from "./pages/Research";
import Zestimates from "./pages/Zestimates";
import About from "./pages/About";
import Careers from "./pages/Careers";
import AgentDashboard from "./pages/AgentDashboard";
import LeadsMarketplace from "./pages/LeadsMarketplace";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={PropertyHome} />
      <Route path="/business-conector" component={Home} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/properties" component={Properties} />
      <Route path="/get-started" component={GetStarted} />
      <Route path="/success" component={Success} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/admin/properties" component={PropertyVerification} />
      <Route path="/admin/agent-ads" component={AgentAds} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/research" component={Research} />
      <Route path="/zestimates" component={Zestimates} />
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/agent-dashboard" component={AgentDashboard} />
      <Route path="/leads-marketplace" component={LeadsMarketplace} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
