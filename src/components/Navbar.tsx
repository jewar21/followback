import {
  Bell,
  ChevronDown,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Network,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import { useAuth } from '../hooks/useAuth'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useCurrentVenture } from '../hooks/useCurrentVenture'
import { useTheme } from '../hooks/useTheme'

type MobileNavItem = {
  to: string
  label: string
  icon: React.ElementType
}

const publicItems: MobileNavItem[] = [
  { to: '/discover', label: 'Explorar', icon: Compass },
  { to: '/network-map', label: 'Mapa de red', icon: Network },
]

const privateItems: MobileNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const currentUser = useCurrentUser()
  const currentVenture = useCurrentVenture()
  const { signOut } = useAuth()
  const { database } = useAppData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const unread = currentUser
    ? database.notifications.filter(
        (n) => n.userId === currentUser.uid && n.status === 'unread',
      ).length
    : 0

  const mobileItems: MobileNavItem[] = [
    ...publicItems,
    ...(currentUser ? privateItems : []),
    ...(currentVenture ? [{ to: `/v/${currentVenture.slug}`, label: 'Mi perfil', icon: UserCircle }] : []),
    ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false)
        setUserMenuOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    function onDown(e: MouseEvent) {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleSignOut() {
    closeMenu()
    setUserMenuOpen(false)
    await signOut()
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          {/* Brand */}
          <Link className="brand-mark" to="/">
            <Sparkles size={16} />
            <span>Voseguime</span>
          </Link>

          {/* Desktop nav – discovery links only */}
          <nav className="site-nav">
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              to="/discover"
            >
              Explorar
            </NavLink>
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              to="/network-map"
            >
              Mapa
            </NavLink>
            {currentVenture ? (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                to={`/v/${currentVenture.slug}`}
              >
                Mi perfil
              </NavLink>
            ) : null}
          </nav>

          {/* Desktop actions */}
          <div className="site-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {currentUser ? (
              <>
                <Link
                  className="notification-link"
                  to="/notifications"
                  aria-label="Notificaciones"
                >
                  <Bell size={16} />
                  {unread > 0 ? <span className="notification-badge">{unread}</span> : null}
                </Link>

                {/* User dropdown */}
                <div className="user-menu dropdown" ref={userMenuRef}>
                  <button
                    className="user-avatar-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="Menú de usuario"
                  >
                    <span className="user-avatar-circle">{initials}</span>
                    <ChevronDown
                      size={13}
                      className={`user-chevron ${userMenuOpen ? 'user-chevron--open' : ''}`}
                    />
                  </button>

                  {userMenuOpen ? (
                    <div className="dropdown-panel user-dropdown">
                      <div className="user-dropdown__info">
                        <strong>{currentUser.displayName}</strong>
                        <span>{currentVenture?.name ?? 'Sin emprendimiento'}</span>
                      </div>

                      <div className="dropdown-divider" />

                      {[
                        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { to: '/favorites', label: 'Favoritos', icon: Heart },
                        { to: '/feedback', label: 'Feedback', icon: MessageSquare },
                        { to: '/settings', label: 'Ajustes', icon: Settings },
                        ...(currentUser.role === 'admin'
                          ? [{ to: '/admin', label: 'Admin', icon: Shield }]
                          : []),
                      ].map(({ to, label, icon: Icon }) => (
                        <button
                          key={to}
                          className="dropdown-item"
                          onClick={() => { setUserMenuOpen(false); navigate(to) }}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      ))}

                      <div className="dropdown-divider" />

                      <button
                        className="dropdown-item dropdown-item--danger"
                        onClick={() => void handleSignOut()}
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link className="button button--primary" to="/login">
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Mobile header right */}
          <div className="header-mobile-right">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {currentUser ? (
              <Link
                className="notification-link"
                to="/notifications"
                aria-label="Notificaciones"
              >
                <Bell size={15} />
                {unread > 0 ? <span className="notification-badge">{unread}</span> : null}
              </Link>
            ) : null}
            <button
              className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="hamburger">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen ? (
        <>
          <div
            className="mobile-overlay-backdrop"
            onClick={closeMenu}
            aria-hidden
          />
          <div className="mobile-overlay-panel" role="dialog" aria-modal>
            {/* Panel header mirrors sticky header */}
            <div className="mobile-overlay-panel__header">
              <Link className="brand-mark" to="/" onClick={closeMenu}>
                <Sparkles size={16} />
                <span>Voseguime</span>
              </Link>
              <button
                className="menu-toggle menu-toggle--open"
                onClick={closeMenu}
                aria-label="Cerrar menú"
              >
                <span className="hamburger">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            </div>

            <div className="mobile-overlay-body">
              {/* User info */}
              {currentUser ? (
                <div className="mobile-nav-user">
                  <div className="mobile-nav-user-avatar">{initials}</div>
                  <div className="mobile-nav-user-info">
                    <strong>{currentUser.displayName}</strong>
                    <span>{currentVenture?.name ?? 'Sin emprendimiento'}</span>
                  </div>
                </div>
              ) : null}

              {/* Public links */}
              {publicItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-item__icon">
                    <Icon size={17} />
                  </span>
                  {label}
                </NavLink>
              ))}

              {/* Private links */}
              {currentUser ? (
                <>
                  <div className="mobile-nav-divider" />
                  {mobileItems
                    .filter((item) => !publicItems.some((p) => p.to === item.to))
                    .map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`
                        }
                        onClick={closeMenu}
                      >
                        <span className="mobile-nav-item__icon">
                          <Icon size={17} />
                        </span>
                        {label}
                      </NavLink>
                    ))}
                </>
              ) : null}

              {/* Footer actions */}
              <div className="mobile-nav-footer">
                {currentUser ? (
                  <button
                    className="button button--ghost button--block"
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    className="button button--primary button--block"
                    to="/login"
                    onClick={closeMenu}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
