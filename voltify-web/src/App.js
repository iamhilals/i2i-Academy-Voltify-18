import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/AuthLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLayout mode="login" />} />
        <Route path="/register" element={<AuthLayout mode="register" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;