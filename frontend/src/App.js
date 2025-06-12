import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashBoard from './Dashboard'
import InteractContract from './Sm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/contract" element={<InteractContract />} />
      </Routes>
    </Router>
  );
}

export default App;
