import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Map from "./pages/Map";
import TaskScreen from "./pages/TaskScreen";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import SpecialMode from "./pages/SpecialMode";

function App() {
  return (
    <Router basename="/Talentia1.0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/task/:id" element={<TaskScreen />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/special" element={<SpecialMode />} />
      </Routes>
    </Router>
  );
}

export default App;

