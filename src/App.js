import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Plan from "./Plan";
import Invites from "./Invites";
import Events from "./Events";
import Money from "./Money";
import InviteCohost from "./InviteCohost";
import Date from "./Date";
import "./App.css";

function App() {
  return (
    <Router basename="/EventHive">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/invites" element={<Invites />} />
        <Route path="/events" element={<Events />} />
        <Route path="/money" element={<Money />} />
        <Route path="/invite-cohost" element={<InviteCohost />} />
        <Route path="/date" element={<Date />} />
      </Routes>
    </Router>
  );
}

export default App;
