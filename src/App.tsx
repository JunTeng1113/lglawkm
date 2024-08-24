import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectLaw from './SelectLaw';
import AddArticleForm from './AddArticleForm';
import BulkAdd from './BulkAdd';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectLaw />} />
        <Route path="/add" element={<AddArticleForm />} />
        <Route path="/bulk" element={<BulkAdd />} />
      </Routes>
    </Router>
  );
};

export default App;
