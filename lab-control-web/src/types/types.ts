export interface Categoria {
  id: number;
  nome: string;
}

export interface ProdutoDTO {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  categoria: Categoria;
  status: 'REPOR' | 'OK';
  dataValidade: string | null;
  diasParaVencimento: number | null;
  vencido: boolean | null;
}

export interface LoteDTO {
  id: number;
  produtoId: number;
  produtoNome: string;
  categoria: Categoria;
  quantidade: number;
  dataValidade: string | null;
  dataEntrada: string;
  diasParaVencimento: number | null;
  vencido: boolean | null;
}

export interface MovimentacaoDTO {
  id: number;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  data: string;
  produtoId: number;
  produtoNome: string;
  loteId: number | null;
  usuarioEmail: string | null;
}

export interface CategoriaProdutos {
  categoria: Categoria;
  produtos: ProdutoDTO[];
}

export interface RelatorioComprasDTO {
  categorias: CategoriaProdutos[];
}
