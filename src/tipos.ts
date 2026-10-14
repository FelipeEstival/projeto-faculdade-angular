export type StatusTarefa = 'Pendente' | 'Em andamento' | 'Concluída';

export type PrioridadeTarefa = 'Baixa' | 'Média' | 'Alta';

export interface Tarefa {
  id: string | number;
  titulo: string;
  status: StatusTarefa | string;
  prioridade: PrioridadeTarefa | string;
  responsavel: string;
  prazo: string;
}
