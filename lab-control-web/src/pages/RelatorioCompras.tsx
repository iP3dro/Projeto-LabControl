import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import type { RelatorioComprasDTO } from '../types/types';
import { formatDate } from '../utils/utils';

export default function RelatorioCompras() {
  const [relatorio, setRelatorio] = useState<RelatorioComprasDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  const carregarRelatorio = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get<RelatorioComprasDTO>('/relatorios/compras');
      setRelatorio(response.data);
      const ids = response.data.categorias.flatMap((c) => c.produtos.map((p) => p.id));
      setSelecionados(new Set(ids));
    } catch {
      setErro('Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const todosIds = relatorio ? relatorio.categorias.flatMap((c) => c.produtos.map((p) => p.id)) : [];
  const todosSelecionados = todosIds.length > 0 && todosIds.every((id) => selecionados.has(id));

  const alternarSelecao = (id: number) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const marcarTodos = (marcar: boolean) => {
    setSelecionados(marcar ? new Set(todosIds) : new Set());
  };

  const gerarPDF = () => {
    if (!relatorio) return;

    const grupos = relatorio.categorias
      .map((grupo) => ({
        ...grupo,
        produtos: grupo.produtos.filter((produto) => selecionados.has(produto.id)),
      }))
      .filter((grupo) => grupo.produtos.length > 0);

    if (grupos.length === 0) {
      setErro('Selecione ao menos um produto para gerar o PDF.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Compras', 14, 16);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

    let y = 30;
    grupos.forEach((grupo) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(grupo.categoria.nome, 14, y);
      doc.setFont('helvetica', 'normal');
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Produto']],
        body: grupo.produtos.map((produto) => [produto.nome]),
        margin: { left: 14, right: 14 },
        theme: 'grid',
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    });

    doc.save('relatorio-compras.pdf');
  };

  const totalItens = relatorio?.categorias.reduce((acc, c) => acc + c.produtos.length, 0) ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Relatório de Compras por Categoria</h1>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={carregarRelatorio}>
            Atualizar
          </button>
          <button className="btn-primary btn-add" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>
      </div>

      <p className="page-description">
        Produtos com tag <span className="badge badge-repor">REPOR</span> agrupados por categoria
        (quantidade atual abaixo do mínimo). Marque quais itens devem entrar no PDF.
      </p>

      {erro && <div className="banner-erro">{erro}</div>}

      {carregando ? (
        <div className="app-loading">Gerando relatório...</div>
      ) : relatorio && relatorio.categorias.length === 0 ? (
        <div className="banner-info">Nenhum produto precisa ser reposto no momento.</div>
      ) : (
        <>
          <div className="relatorio-toolbar">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={(e) => marcarTodos(e.target.checked)}
              />
              Selecionar todos
            </label>
            <span className="relatorio-contagem">
              {selecionados.size} de {totalItens} selecionado(s)
            </span>
          </div>

          {relatorio?.categorias.map((grupo) => (
            <section className="section" key={grupo.categoria.id}>
              <h2>{grupo.categoria.nome}</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="col-checkbox">Incluir</th>
                      <th>Produto</th>
                      <th>Estoque Atual</th>
                      <th>Mínimo</th>
                      <th>Faltam</th>
                      <th>Validade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td className="col-checkbox">
                          <input
                            type="checkbox"
                            checked={selecionados.has(produto.id)}
                            onChange={() => alternarSelecao(produto.id)}
                          />
                        </td>
                        <td>{produto.nome}</td>
                        <td>{produto.quantidadeAtual}</td>
                        <td>{produto.quantidadeMinima}</td>
                        <td>{produto.quantidadeMinima - produto.quantidadeAtual}</td>
                        <td>{formatDate(produto.dataValidade)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
