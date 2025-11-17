import { Route, Switch } from "wouter";
import SiteLayout from "@/layouts/SiteLayout";
import PropertyHome from "@/pages/PropertyHome";
import Home from "@/pages/Home";
import ListingDetails from "@/pages/ListingDetails";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

export default function App() {
  return (
    <SiteLayout>
      <Switch>
        <Route path="/" component={PropertyHome} />
        <Route path="/properties" component={Home} />
        <Route path="/listing/:id" component={ListingDetails} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </SiteLayout>
  );
}
