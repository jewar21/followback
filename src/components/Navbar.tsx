import { Bell, Menu, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useCurrentVenture } from '../hooks/useCurrentVenture'
import { useAuth } from '../hooks/useAuth'
import { useAppData } from '../app/providers/AppDataProvider'

const publicLinks = [
  { to: '/discover', label: 'Explorar' },
  { to: '/network-map', label: 'Mapa' },
]

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/favorites', label: 'Favoritos' },
  { to: '/notifications', label: 'Notificaciones' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/settings', label: 'Settings' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const currentUser = useCurrentUser()
  const currentVenture = useCurrentVenture()
  const { signOut } = useAuth()
  const { database } = useAppData()
  const links = [
    ...publicLinks,
    ...(currentUser ? privateLinks : []),
    ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]
  const unreadNotifications = currentUser
    ? database.notifications.filter((notification) => notification.userId === currentUser.uid && notification.status === 'unread').length
    : 0

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand-mark" to="/">
          <Sparkles size={18} />
          <span>FollowBack</span>
        </Link>

        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
          <Menu size={20} />
        </button>

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
          {currentUser ? (
            <>
              <Link className="notification-link" to="/notifications" aria-label="Abrir notificaciones">
                <Bell size={18} />
                {unreadNotifications > 0 ? <span className="notification-badge">{unreadNotifications}</span> : null}
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
              Iniciar sesion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
