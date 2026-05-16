import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>FollowBack</strong>
          <p>Descubre emprendimientos, abre sus redes y construye una comunidad de apoyo visible.</p>
        </div>
        <div className="footer-links">
          <Link to="/discover">Explorar directorio</Link>
          <Link to="/network-map">Ver mapa</Link>
          <Link to="/login">Acceder</Link>
        </div>
      </div>
    </footer>
  )
}
