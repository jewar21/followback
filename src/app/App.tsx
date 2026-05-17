import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { LoadingState } from '../components/LoadingState'
import { AdminGuard } from './guards/AdminGuard'
import { AuthGuard } from './guards/AuthGuard'
import { PublicRoute } from './guards/PublicRoute'
import { AppDataProvider } from './providers/AppDataProvider'
import { AuthProvider } from '../hooks/useAuth'
import { ToastProvider } from '../hooks/useToast'

const AdminPage = lazy(() => import('../pages/AdminPage').then((module) => ({ default: module.AdminPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const DiscoverPage = lazy(() => import('../pages/DiscoverPage').then((module) => ({ default: module.DiscoverPage })))
const FavoritesPage = lazy(() => import('../pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })))
const FeedbackPage = lazy(() => import('../pages/FeedbackPage').then((module) => ({ default: module.FeedbackPage })))
const LandingPage = lazy(() => import('../pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const NetworkMapPage = lazy(() => import('../pages/NetworkMapPage').then((module) => ({ default: module.NetworkMapPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const VentureNetworksPage = lazy(() =>
  import('../pages/VentureNetworksPage').then((module) => ({ default: module.VentureNetworksPage })),
)
const VenturePublicPage = lazy(() =>
  import('../pages/VenturePublicPage').then((module) => ({ default: module.VenturePublicPage })),
)

function RouteFallback() {
  return (
    <div className="page">
      <div className="container">
        <LoadingState />
      </div>
    </div>
  )
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={withSuspense(<LandingPage />)} />
                <Route path="/discover" element={withSuspense(<DiscoverPage />)} />
                <Route path="/v/:slug" element={withSuspense(<VenturePublicPage />)} />
                <Route path="/ventures/:slug/networks" element={withSuspense(<VentureNetworksPage />)} />
                <Route path="/network-map" element={withSuspense(<NetworkMapPage />)} />

                <Route element={<PublicRoute />}>
                  <Route path="/login" element={withSuspense(<LoginPage />)} />
                </Route>

                <Route element={<AuthGuard />}>
                  <Route path="/onboarding" element={withSuspense(<OnboardingPage />)} />
                  <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
                  <Route path="/favorites" element={withSuspense(<FavoritesPage />)} />
                  <Route path="/feedback" element={withSuspense(<FeedbackPage />)} />
                  <Route path="/notifications" element={withSuspense(<NotificationsPage />)} />
                  <Route path="/settings" element={withSuspense(<SettingsPage />)} />
                </Route>

                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={withSuspense(<AdminPage />)} />
                </Route>

                <Route path="*" element={withSuspense(<NotFoundPage />)} />
              </Route>
            </Routes>
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
