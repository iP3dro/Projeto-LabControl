import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Layout from '../src/components/Layout';
import { ThemeProvider } from '../src/theme/ThemeContext';

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
}));

vi.mock('../src/services/firebaseConfig', () => ({
  auth: {},
}));

vi.mock('../src/auth/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'teste@labcontrol.test' }, loading: false }),
}));

describe('Layout (responsividade estrutural)', () => {
  it('renderiza a navegação e os dois controles de tema (desktop e mobile)', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('LabControl')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Movimentações')).toBeInTheDocument();

    expect(document.querySelector('.topbar')).toBeInTheDocument();
    expect(document.querySelector('.theme-picker')).toBeInTheDocument();
    expect(document.querySelector('.theme-picker-mobile')).toBeInTheDocument();
  });
});
