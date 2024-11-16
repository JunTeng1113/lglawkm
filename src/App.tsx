import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegulationManager from './RegulationManager';
import BulkEdit from './AddArticleForm';
import SelectLaw from './SelectLaw';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/select-law" element={<SelectLaw />} />
        <Route path="/" element={<RegulationManager />} />
        <Route path="/bulk-edit/:regulationId" element={<BulkEdit />} />
      </Routes>
    </Router>
  );
};

export default App;
