import { RouterLink } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import type { Tarefa, Projeto, Status } from '../../../tipos';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';
import { BoardHeader } from '../../components/board-header/board-header';
import { Icon } from '../../components/icon';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-tarefas',
  imports: [
    BoardHeader,
    TarefaCard,
    RouterLink,
    Icon,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    CdkDropListGroup,
  ],
  templateUrl: './tarefas.html',
  styleUrl: './tarefas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tarefas {
  private readonly api = inject(TarefasService);
  protected readonly tarefas = signal<Tarefa[]>([]);
  protected readonly projetos = signal<Projeto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly aviso = signal('');
  protected readonly salvando = signal(false);
  protected readonly busca = signal('');
  protected readonly projetoId = signal('');
  protected readonly prioridade = signal('');
  protected readonly ordenacao = signal('manual');
  protected readonly filtrosAbertos = signal(false);
  protected readonly colunas: { id: Status; titulo: string; cor: string }[] = [
    { id: 'a-fazer', titulo: 'A FAZER', cor: '#bac1dc' },
    { id: 'em-andamento', titulo: 'EM ANDAMENTO', cor: '#7dd3fc' },
    { id: 'em-revisao', titulo: 'EM REVISÃO', cor: '#c084fc' },
    { id: 'concluida', titulo: 'CONCLUÍDA', cor: '#8fe0b6' },
  ];
  protected readonly projetoAtual = computed(() =>
    this.projetos().find((p) => p.id === this.projetoId()),
  );
  protected readonly tarefasProjeto = computed(() =>
    this.tarefas().filter((t) => !this.projetoId() || t.projetoId === this.projetoId()),
  );
  protected readonly membros = computed(() => [
    ...new Set(
      this.tarefasProjeto()
        .map((t) => t.responsavel.trim())
        .filter(Boolean),
    ),
  ]);
  protected readonly concluidas = computed(
    () => this.tarefasProjeto().filter((t) => t.status === 'concluida').length,
  );
  protected readonly progresso = computed(() =>
    this.tarefasProjeto().length
      ? Math.round((this.concluidas() / this.tarefasProjeto().length) * 100)
      : 0,
  );
  protected readonly visiveis = computed(() => {
    const termo = this.busca().trim().toLocaleLowerCase('pt-BR');
    const lista = this.tarefasProjeto().filter(
      (t) =>
        (!this.prioridade() || t.prioridade === this.prioridade()) &&
        (!termo ||
          `${t.titulo} ${t.descricao} ${t.responsavel}`.toLocaleLowerCase('pt-BR').includes(termo)),
    );
    if (this.ordenacao() === 'prazo') lista.sort((a, b) => a.prazo.localeCompare(b.prazo));
    if (this.ordenacao() === 'prioridade') {
      const pesos = { alta: 0, media: 1, baixa: 2 };
      lista.sort((a, b) => pesos[a.prioridade] - pesos[b.prioridade]);
    }
    return lista;
  });
  protected readonly quadro = computed(() =>
    this.colunas.map((c) => ({ ...c, tarefas: this.visiveis().filter((t) => t.status === c.id) })),
  );

  constructor() {
    afterNextRender(() => {
      this.carregarTarefas();
      this.api.getTodosProjetos().subscribe({
        next: (projetos) => this.projetos.set(projetos),
        error: () =>
          this.aviso.set(
            'Não foi possível carregar os projetos. O quadro geral continua disponível.',
          ),
      });
    });
  }
  protected carregarTarefas(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.getTodas().subscribe({
      next: (tarefas) => {
        this.tarefas.set(tarefas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as tarefas. Verifique se a API está funcionando.');
        this.carregando.set(false);
      },
    });
  }
  protected mover(tarefa: Tarefa, status: string): void {
    if (this.salvando() || tarefa.status === status || !this.colunas.some((c) => c.id === status))
      return;
    const anterior = this.tarefas();
    this.salvando.set(true);
    this.erro.set('');
    this.tarefas.update((lista) =>
      lista.map((t) => (t.id === tarefa.id ? { ...t, status: status as Status } : t)),
    );
    this.api.atualizarTarefa(tarefa.id, { status: status as Status }).subscribe({
      next: (salva) => {
        this.tarefas.update((lista) => lista.map((t) => (t.id === salva.id ? salva : t)));
        this.salvando.set(false);
        this.aviso.set(
          `“${tarefa.titulo}” movida para ${this.colunas.find((c) => c.id === status)?.titulo.toLowerCase()}.`,
        );
      },
      error: () => {
        this.tarefas.set(anterior);
        this.salvando.set(false);
        this.erro.set(
          'Não foi possível salvar a movimentação. A tarefa voltou à coluna anterior. Tente novamente.',
        );
      },
    });
  }
  protected soltar(event: CdkDragDrop<Status, Status, Tarefa>): void {
    if (this.salvando()) return;
    const tarefa = event.item.data;
    if (event.previousContainer !== event.container) {
      this.mover(tarefa, event.container.data);
    } else if (this.ordenacao() === 'manual') {
      // Reordenação visual da sessão: o modelo da API não possui campo de posição.
      const visiveis = this.visiveis().filter((t) => t.status === tarefa.status);
      const ids = new Set(visiveis.map((t) => t.id));
      const index = visiveis.findIndex((t) => t.id === tarefa.id);
      if (index < 0) return;
      visiveis.splice(index, 1);
      visiveis.splice(event.currentIndex, 0, tarefa);
      let cursor = 0;
      this.tarefas.update((lista) => lista.map((t) => (ids.has(t.id) ? visiveis[cursor++] : t)));
    }
  }
}
