import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import FileUploadBulk from './pages/FileUploadBulk';
import QualityControl from './pages/QualityControl';
import Reconciliation from './pages/Reconciliation';
import ConsolidatedDashboard from './pages/ConsolidatedDashboard';
import Alerts from './pages/Alerts';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/upload-bulk" element={<FileUploadBulk />} />
          <Route path="/quality-control" element={<QualityControl />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/consolidated" element={<ConsolidatedDashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;