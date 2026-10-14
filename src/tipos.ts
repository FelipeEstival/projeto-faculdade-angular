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


export interface Projeto {
  id: string | number;
  nome?: string;
  titulo?: string;
  descricao?: string;
  [campo: string]: unknown;
}

export interface ProjetoComTarefas extends Projeto {
  tarefas: Tarefa[];
}
