import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/categorias', label: 'Categorias', icon: '🏷️' },
  { to: '/produtos', label: 'Produtos', icon: '📦' },
  { to: '/movimentacoes', label: 'Movimentações', icon: '🔄' },
  { to: '/relatorio', label: 'Relatórios', icon: '📋' },
];

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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
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
