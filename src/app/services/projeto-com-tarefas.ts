import type { Projeto, Tarefa } from '../../tipos';

export interface ProjetoComTarefas extends Projeto {
  tarefas: Tarefa[];
}
