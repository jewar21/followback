import { Bell, Menu, Moon, Sparkles, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useCurrentVenture } from '../hooks/useCurrentVenture'
import { useAuth } from '../hooks/useAuth'
import { useAppData } from '../app/providers/AppDataProvider'
import { useTheme } from '../hooks/useTheme'

const publicLinks = [
  { to: '/discover', label: 'Explorar' },
  { to: '/network-map', label: 'Mapa' },
]

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/favorites', label: 'Favoritos' },
  { to: '/notifications', label: 'Notificaciones' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/settings', label: 'Ajustes' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const currentUser = useCurrentUser()
  const currentVenture = useCurrentVenture()
  const { signOut } = useAuth()
  const { database } = useAppData()
  const { theme, toggleTheme } = useTheme()

  const links = [
    ...publicLinks,
    ...(currentUser ? privateLinks : []),
    ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  const unreadNotifications = currentUser
    ? database.notifications.filter(
        (n) => n.userId === currentUser.uid && n.status === 'unread',
      ).length
    : 0

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand-mark" to="/">
          <Sparkles size={17} />
          <span>Voseguime</span>
        </Link>

        <nav className={`site-nav ${open ? 'site-nav--open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              to={link.to}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {currentVenture ? (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              to={`/v/${currentVenture.slug}`}
              onClick={() => setOpen(false)}
            >
              Mi perfil
            </NavLink>
          ) : null}
        </nav>

        <div className="site-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {currentUser ? (
            <>
              <Link className="notification-link" to="/notifications" aria-label="Notificaciones">
                <Bell size={17} />
                {unreadNotifications > 0 ? (
                  <span className="notification-badge">{unreadNotifications}</span>
                ) : null}
              </Link>
              <div className="user-chip">
                <strong>{currentUser.displayName}</strong>
                <span>{currentVenture?.name ?? 'Sin emprendimiento'}</span>
              </div>
              <button
                className="button button--ghost"
                onClick={() => {
                  void signOut()
                  setOpen(false)
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link className="button button--primary" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {currentUser ? (
            <Link className="notification-link" to="/notifications" aria-label="Notificaciones">
              <Bell size={16} />
              {unreadNotifications > 0 ? (
                <span className="notification-badge">{unreadNotifications}</span>
              ) : null}
            </Link>
          ) : null}
          <button className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
