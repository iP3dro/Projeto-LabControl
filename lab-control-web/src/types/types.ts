export interface Categoria {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  dataValidade?: string | null;
  categoria?: Categoria;
}

export interface ProdutoDTO {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  dataValidade: string | null;
  categoria: Categoria;
  status: 'REPOR' | 'OK';
  diasParaVencimento: number | null;
  vencido: boolean | null;
}

export interface CategoriaProdutos {
  categoria: Categoria;
  produtos: ProdutoDTO[];
}

export interface RelatorioComprasDTO {
  categorias: CategoriaProdutos[];
}
