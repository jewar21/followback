import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { AdminGuard } from './guards/AdminGuard'
import { AuthGuard } from './guards/AuthGuard'
import { PublicRoute } from './guards/PublicRoute'
import { AppDataProvider } from './providers/AppDataProvider'
import { AdminPage } from '../pages/AdminPage'
import { AuthProvider } from '../hooks/useAuth'
import { ToastProvider } from '../hooks/useToast'
import { DashboardPage } from '../pages/DashboardPage'
import { DiscoverPage } from '../pages/DiscoverPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { FeedbackPage } from '../pages/FeedbackPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NetworkMapPage } from '../pages/NetworkMapPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { SettingsPage } from '../pages/SettingsPage'
import { VentureNetworksPage } from '../pages/VentureNetworksPage'
import { VenturePublicPage } from '../pages/VenturePublicPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/v/:slug" element={<VenturePublicPage />} />
                <Route path="/ventures/:slug/networks" element={<VentureNetworksPage />} />
                <Route path="/network-map" element={<NetworkMapPage />} />

                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<AuthGuard />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
