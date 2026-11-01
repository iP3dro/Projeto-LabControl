import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RelatorioCompras from '../src/pages/RelatorioCompras';
import api from '../src/services/api';
import type { ProdutoDTO } from '../src/types/types';

vi.mock('../src/services/api', () => ({
  default: { get: vi.fn() },
}));

const saveMock = vi.fn();
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    save: saveMock,
  })),
}));
vi.mock('jspdf-autotable', () => ({
  default: vi.fn((doc: Record<string, unknown>) => {
    doc.lastAutoTable = { finalY: 0 };
  }),
}));

function produto(id: number, nome: string, atual: number, minima: number, categoriaId: number, categoriaNome: string): ProdutoDTO {
  return {
    id,
    nome,
    quantidadeAtual: atual,
    quantidadeMinima: minima,
    categoria: { id: categoriaId, nome: categoriaNome, ativo: true },
    status: atual < minima ? 'REPOR' : 'OK',
    dataValidade: null,
    diasParaVencimento: null,
    vencido: null,
    ativo: true,
  };
}

const relatorio = {
  categorias: [
    {
      categoria: { id: 1, nome: 'Resinas', ativo: true },
      produtos: [
        produto(1, 'Resina A', 2, 5, 1, 'Resinas'),
        produto(2, 'Resina B', 1, 3, 1, 'Resinas'),
      ],
    },
    {
      categoria: { id: 2, nome: 'Porcelanas', ativo: true },
      produtos: [produto(3, 'Porcelana X', 0, 2, 2, 'Porcelanas')],
    },
  ],
};

describe('RelatorioCompras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: relatorio });
  });

  it('agrupa os produtos por categoria', async () => {
    render(<RelatorioCompras />);

    await waitFor(() => expect(screen.getByText('Resinas')).toBeInTheDocument());
    expect(screen.getByText('Resina A')).toBeInTheDocument();
    expect(screen.getByText('Porcelanas')).toBeInTheDocument();
    expect(screen.getByText('Porcelana X')).toBeInTheDocument();
  });

  it('seleciona todos os itens por padrão', async () => {
    render(<RelatorioCompras />);

    await waitFor(() => expect(screen.getByText('3 de 3 selecionado(s)')).toBeInTheDocument());
  });

  it('permite desmarcar um item', async () => {
    render(<RelatorioCompras />);
    await waitFor(() => expect(screen.getByText('Resina A')).toBeInTheDocument());

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(screen.getByText('2 de 3 selecionado(s)')).toBeInTheDocument();
  });

  it('selecionar todos marca e desmarca tudo', async () => {
    render(<RelatorioCompras />);
    await waitFor(() => expect(screen.getByText('Resina A')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Selecionar todos'));
    expect(screen.getByText('0 de 3 selecionado(s)')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Selecionar todos'));
    expect(screen.getByText('3 de 3 selecionado(s)')).toBeInTheDocument();
  });

  it('gera o PDF com os itens selecionados', async () => {
    render(<RelatorioCompras />);
    await waitFor(() => expect(screen.getByText('Resina A')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }));

    await waitFor(() => expect(saveMock).toHaveBeenCalledWith('relatorio-compras.pdf'));
  });

  it('avisa ao tentar gerar sem nenhum item selecionado', async () => {
    render(<RelatorioCompras />);
    await waitFor(() => expect(screen.getByText('Resina A')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Selecionar todos'));
    fireEvent.click(screen.getByRole('button', { name: 'Gerar PDF' }));

    expect(screen.getByText('Selecione ao menos um produto para gerar o PDF.')).toBeInTheDocument();
    expect(saveMock).not.toHaveBeenCalled();
  });
});
