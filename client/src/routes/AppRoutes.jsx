import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Spinner from '../components/Spinner';

// Lazy-load page components so users only download what they need on demand
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const PlanningPage = lazy(() => import('../features/steps/PlanningPage'));
const StepDetailPage = lazy(() => import('../features/steps/StepDetailPage'));
const PurchasePage = lazy(() => import('../features/purchases/PurchasePage'));
const PurchaseDetailPage = lazy(() => import('../features/purchases/PurchaseDetailPage'));
const PurchaseDashboardPage = lazy(() => import('../features/purchases/PurchaseDashboardPage'));
const FinancePage = lazy(() => import('../features/finance/FinancePage'));
const MarketingPage = lazy(() => import('../features/marketing/MarketingPage'));
const MarketingDetailPage = lazy(() => import('../features/marketing/MarketingDetailPage'));
const FeaturesPage = lazy(() => import('../features/features/FeaturesPage'));
const FeatureDetailPage = lazy(() => import('../features/features/FeatureDetailPage'));
const DeliveryPage = lazy(() => import('../features/delivery/DeliveryPage'));
const DeliveryDetailPage = lazy(() => import('../features/delivery/DeliveryDetailPage'));
const AppProgressPage = lazy(() => import('../features/appProgress/AppProgressPage'));
const AppFeatureDetailPage = lazy(() => import('../features/appProgress/AppFeatureDetailPage'));
const DeploymentPage = lazy(() => import('../features/deployment/DeploymentPage'));
const DeploymentDetailPage = lazy(() => import('../features/deployment/DeploymentDetailPage'));
const PackingPage = lazy(() => import('../features/packing/PackingPage'));
const PackingDetailPage = lazy(() => import('../features/packing/PackingDetailPage'));
const AdminUsersPage = lazy(() => import('../features/users/AdminUsersPage'));

const RouteLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <Spinner className="h-8 w-8 text-brand-600" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
          path="purchase-dashboard"
          element={
            <ProtectedRoute permission="purchase">
              <PurchaseDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute permission="purchase">
              <FinancePage />
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
          path="deployment"
          element={
            <ProtectedRoute permission="deployment">
              <DeploymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="deployment/:id"
          element={
            <ProtectedRoute permission="deployment">
              <DeploymentDetailPage />
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
    </Suspense>
  );
}
