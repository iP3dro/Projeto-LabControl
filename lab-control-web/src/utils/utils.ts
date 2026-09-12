import axios from 'axios';

export function extrairErro(error: unknown, padrao = 'Não foi possível concluir a operação.'): string {
  if (axios.isAxiosError(error) && error.response?.data?.erro) {
    return error.response.data.erro;
  }
  return padrao;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

export function statusOf(quantidadeAtual: number, quantidadeMinima: number): 'REPOR' | 'OK' {
  return quantidadeAtual <= quantidadeMinima ? 'REPOR' : 'OK';
}
