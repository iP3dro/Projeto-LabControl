import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🧪</span>
          <span className="brand-name">LabControl</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/produtos" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Produtos
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Categorias
          </NavLink>
          <NavLink to="/relatorio" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Relatório de Compras
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
