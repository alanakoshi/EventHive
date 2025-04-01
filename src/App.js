import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Plan from "./Plan";
import Invites from "./Invites";
import Events from "./Events";
import Money from "./Money";
import InviteCohost from "./InviteCohost";
import Date from "./Date";
import Theme from "./Theme";
import Venue from "./Venue";
import Budget from "./Budget";
import Voting from "./Voting";
import FinalResult from "./FinalResult";
import Tasks from "./Tasks";
import SplitBudget from "./SplitBudget";
import Complete from "./Complete";
import { EventProvider } from "./EventContext";
import "./App.css";

function App() {
  return (
    <EventProvider>
      <Router basename="/EventHive">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/invites" element={<Invites />} />
          <Route path="/events" element={<Events />} />
          <Route path="/money" element={<Money />} />
          <Route path="/invite-cohost" element={<InviteCohost />} />
          <Route path="/date" element={<Date />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/final-result" element={<FinalResult />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/split-budget" element={<SplitBudget />} />
          <Route path="/complete" element={<Complete />} />
        </Routes>
      </Router>
    </EventProvider>
  );
}

export default App;
