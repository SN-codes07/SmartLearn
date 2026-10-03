import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';

// Pages
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import AssessmentSelection from './pages/AssessmentSelection';
import Assessment from './pages/Assessment';
import AssessmentResult from './pages/AssessmentResult';
import Learning from './pages/Learning';
import Practice from './pages/Practice';
import ReassessmentResult from './pages/ReassessmentResult';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentDetail from './pages/AdminStudentDetail';
import Landing from './pages/Landing';

import './App.css';

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Authenticating session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route guard strictly for administrators
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Verifying administrator credentials...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Landing for guests, Dashboard for students, Admin for administrators
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Authenticating session...
      </div>
    );
  }
  if (!user) {
    return <Landing />;
  }
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <Dashboard />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            
            <main className="main-content">
              <Routes>
                {/* Public Marketing & Auth Routes */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Root Route: Landing for guests, Dashboard for students */}
                <Route path="/" element={<HomeRoute />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/learning-path" element={
                  <ProtectedRoute>
                    <LearningPath />
                  </ProtectedRoute>
                } />
                <Route path="/select-assessment" element={
                  <ProtectedRoute>
                    <AssessmentSelection />
                  </ProtectedRoute>
                } />
                <Route path="/assessment" element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                } />
                <Route path="/result/:attemptId" element={
                  <ProtectedRoute>
                    <AssessmentResult />
                  </ProtectedRoute>
                } />
                <Route path="/learning/:conceptId" element={
                  <ProtectedRoute>
                    <Learning />
                  </ProtectedRoute>
                } />
                <Route path="/practice/:conceptId" element={
                  <ProtectedRoute>
                    <Practice type="PRACTICE" />
                  </ProtectedRoute>
                } />
                <Route path="/reassessment/:conceptId" element={
                  <ProtectedRoute>
                    <Practice type="REASSESSMENT" />
                  </ProtectedRoute>
                } />
                <Route path="/reassessment-result/:attemptId" element={
                  <ProtectedRoute>
                    <ReassessmentResult />
                  </ProtectedRoute>
                } />
                <Route path="/adaptive-quiz/:conceptId" element={
                  <ProtectedRoute>
                    <AdaptiveQuiz />
                  </ProtectedRoute>
                } />

                {/* Institutional Administrator Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/students/:id" element={
                  <AdminRoute>
                    <AdminStudentDetail />
                  </AdminRoute>
                } />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            <AIAssistant />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
