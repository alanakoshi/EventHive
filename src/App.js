import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";  // New AuthPage for login/signup
import Home from "./Home";
import Plan from "./Plan";
import Events from "./Events";
import InviteCohost from "./InviteCohost";
import Date from "./Date";
import Theme from "./Theme";
import Venue from "./Venue";
import Voting from "./Voting";
import FinalResult from "./FinalResult";
import Tasks from "./Tasks";
import Complete from "./Complete";
import { EventProvider } from "./EventContext";
import { CohostProvider } from "./CohostContext";
import "./App.css";

function App() {
  return (
    <EventProvider>
      <CohostProvider>
        <Router basename="/EventHive">
          <Routes>
            {/* Default route to auth page */}
            <Route path="/" element={<AuthPage />} />
            {/* Other Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/events" element={<Events />} />
            <Route path="/invite-cohost" element={<InviteCohost />} />
            <Route path="/date" element={<Date />} />
            <Route path="/theme" element={<Theme />} />
            <Route path="/venue" element={<Venue />} />
            <Route path="/voting" element={<Voting />} />
            <Route path="/final-result" element={<FinalResult />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/complete" element={<Complete />} />
          </Routes>
        </Router>
      </CohostProvider>
    </EventProvider>
  );
}

export default App;
