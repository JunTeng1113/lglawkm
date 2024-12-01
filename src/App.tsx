import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegulationManager from './RegulationManager';
import BulkEdit from './AddArticleForm';
import RegulationView from './RegulationView';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
              <RegulationManager />
          } />
          <Route path="/bulk-edit/:id" element={
            <ProtectedRoute requiredRole="admin">
              <BulkEdit />
            </ProtectedRoute>
          } />
          <Route path="/regulation/:regulation_number" element={
            <RegulationView />
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
