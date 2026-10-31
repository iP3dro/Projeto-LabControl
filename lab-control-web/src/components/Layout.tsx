import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../auth/AuthContext';
import { useTheme, type Theme } from '../theme/ThemeContext';
import { ToothIcon, SunIcon, MoonIcon, DropletIcon } from './icons';

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

const themeOptions: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: 'clean', label: 'Clean', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'blue', label: 'Blue', Icon: DropletIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">
          <ToothIcon className="brand-tooth" />
          <span className="brand-name">LabControl</span>
        </div>

        <nav className="topbar-nav">
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

        <div className="topbar-actions">
          <div className="theme-picker" role="group" aria-label="Escolha do tema">
            {themeOptions.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                className={`theme-option ${theme === value ? 'active' : ''}`}
                title={label}
                aria-label={label}
                onClick={() => setTheme(value)}
              >
                <Icon />
              </button>
            ))}
          </div>
          <span className="user-email">{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
