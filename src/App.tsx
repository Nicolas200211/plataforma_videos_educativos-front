import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { SubscriptionPlans } from './pages/admin/SubscriptionPlans';
import { Videos } from './pages/admin/Videos';
import { Categories } from './pages/admin/Categories';
import { Users } from './pages/admin/Users';
import { Enrollments } from './pages/admin/Enrollments';
import { EnrollmentsDebug } from './pages/admin/EnrollmentsDebug';

// Student Pages
import { SubscriptionPage } from './pages/student/SubscriptionPage';
import { VideosCatalog } from './pages/student/VideosCatalog';
import { VideoPlayer } from './pages/student/VideoPlayer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Infinity,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirect based on auth status */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/student/videos" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="plans" element={<SubscriptionPlans />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="enrollments-debug" element={<EnrollmentsDebug />} />
          <Route path="videos" element={<Videos />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student">
          <Route index element={<Navigate to="/student/videos" replace />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="videos" element={<VideosCatalog />} />
          <Route path="video/:id" element={<VideoPlayer />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
