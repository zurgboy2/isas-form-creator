import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainBuilder from './components/MainBuilder';
import ApprovalDashboard from './components/ApprovalDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainBuilder />} />
          <Route path="/builder" element={<MainBuilder />} />
          <Route path="/approval/:formId" element={<ApprovalDashboard />} />
          <Route path="*" element={<MainBuilder />} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;