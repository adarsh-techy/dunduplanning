import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import SignupPage from '../features/auth/SignupPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import PlanningPage from '../features/steps/PlanningPage';
import StepDetailPage from '../features/steps/StepDetailPage';
import PurchasePage from '../features/purchases/PurchasePage';
import PurchaseDetailPage from '../features/purchases/PurchaseDetailPage';
import MarketingPage from '../features/marketing/MarketingPage';
import MarketingDetailPage from '../features/marketing/MarketingDetailPage';
import FeaturesPage from '../features/features/FeaturesPage';
import FeatureDetailPage from '../features/features/FeatureDetailPage';
import DeliveryPage from '../features/delivery/DeliveryPage';
import DeliveryDetailPage from '../features/delivery/DeliveryDetailPage';
import AppProgressPage from '../features/appProgress/AppProgressPage';
import AppFeatureDetailPage from '../features/appProgress/AppFeatureDetailPage';
import PackingPage from '../features/packing/PackingPage';
import PackingDetailPage from '../features/packing/PackingDetailPage';
import AdminUsersPage from '../features/users/AdminUsersPage';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="planning"
          element={
            <ProtectedRoute permission="planning">
              <PlanningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="planning/:id"
          element={
            <ProtectedRoute permission="planning">
              <StepDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchases"
          element={
            <ProtectedRoute permission="purchase">
              <PurchasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchases/:id"
          element={
            <ProtectedRoute permission="purchase">
              <PurchaseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="marketing"
          element={
            <ProtectedRoute permission="marketing">
              <MarketingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="marketing/:id"
          element={
            <ProtectedRoute permission="marketing">
              <MarketingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="features"
          element={
            <ProtectedRoute permission="features">
              <FeaturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="features/:id"
          element={
            <ProtectedRoute permission="features">
              <FeatureDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="delivery"
          element={
            <ProtectedRoute permission="delivery">
              <DeliveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="delivery/:id"
          element={
            <ProtectedRoute permission="delivery">
              <DeliveryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app-progress"
          element={
            <ProtectedRoute permission="app">
              <AppProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app-progress/:id"
          element={
            <ProtectedRoute permission="app">
              <AppFeatureDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="packing"
          element={
            <ProtectedRoute permission="packing">
              <PackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="packing/:id"
          element={
            <ProtectedRoute permission="packing">
              <PackingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute requireSuperAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
