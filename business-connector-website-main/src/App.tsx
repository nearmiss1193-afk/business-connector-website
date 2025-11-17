import { Route, Switch } from "wouter";
import SiteLayout from "@/layouts/SiteLayout";
import Home from "@/pages/Home";
import ListingDetails from "@/pages/ListingDetails";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <SiteLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/properties" component={Home} />
        <Route path="/listing/:id" component={ListingDetails} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </SiteLayout>
  );
}
