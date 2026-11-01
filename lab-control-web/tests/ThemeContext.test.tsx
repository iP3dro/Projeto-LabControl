import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function Tester() {
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme('dark')}>
      tema: {theme}
    </button>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('aplica o data-theme no documentElement ao trocar de tema', () => {
    render(
      <ThemeProvider>
        <Tester />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText(/tema:/));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persiste o tema escolhido no localStorage', () => {
    render(
      <ThemeProvider>
        <Tester />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText(/tema:/));

    expect(localStorage.getItem('labcontrol-theme')).toBe('dark');
  });
});
