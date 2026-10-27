
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import type { Tarefa, Projeto, Status } from '../../../tipos';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';
import { BoardHeader } from '../../components/board-header/board-header';
import { Icon } from '../../components/icon';
import { TarefasService } from '../../services/tarefas.service';
import { FiltrosTarefasService } from '../../services/filtros-tarefas.service';

@Component({
  selector: 'app-tarefas',
  imports: [
    BoardHeader,
    TarefaCard,
    RouterLink,
    Icon,
  ],
  templateUrl: './tarefas.html',
  styleUrl: './tarefas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tarefas {
  private readonly api = inject(TarefasService);
  private readonly filtros = inject(FiltrosTarefasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly visao = signal<'lista' | 'quadro'>('quadro');

  protected readonly tarefas = signal<Tarefa[]>([]);
  protected readonly projetos = signal<Projeto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly aviso = signal('');
  protected readonly salvando = signal(false);

  protected readonly busca = this.filtros.busca;
  protected readonly projetoId = this.filtros.projetoId;
  protected readonly prioridade = this.filtros.prioridade;
  protected readonly status = this.filtros.status;
  protected readonly ordenacao = this.filtros.ordenacao;

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
    this.tarefas().filter(
      (t) => !this.projetoId() || t.projetoId === this.projetoId(),
    ),
  );

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
        (!this.status() || t.status === this.status()) &&
        (!termo || t.titulo.toLocaleLowerCase('pt-BR').includes(termo)),
    );

    if (this.ordenacao() === 'prazo') {
      lista.sort((a, b) => a.prazo.localeCompare(b.prazo));
    }

    if (this.ordenacao() === 'prioridade') {
      const pesos = { alta: 0, media: 1, baixa: 2 };
      lista.sort((a, b) => pesos[a.prioridade] - pesos[b.prioridade]);
    }

    return lista;
  });

  protected readonly quadro = computed(() =>
    this.colunas.map((c) => ({
      ...c,
      tarefas: this.visiveis().filter((t) => t.status === c.id),
    })),
  );

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.visao.set(data['visao'] === 'lista' ? 'lista' : 'quadro');
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.busca.set(params.get('q') ?? '');
      this.projetoId.set(params.get('projetoId') ?? '');

      const prioridade = params.get('prioridade') ?? '';
      this.prioridade.set(
        ['alta', 'media', 'baixa'].includes(prioridade) ? prioridade : '',
      );

      const status = params.get('status') ?? '';
      this.status.set(
        this.colunas.some((c) => c.id === status) ? status : '',
      );

      const ordem = params.get('ordem') ?? 'manual';
      this.ordenacao.set(
        ['manual', 'prazo', 'prioridade'].includes(ordem) ? ordem : 'manual',
      );
    });

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

  protected atualizarFiltro(campo: string, valor: string): void {
    const sinais = {
      q: this.busca,
      projetoId: this.projetoId,
      prioridade: this.prioridade,
      status: this.status,
      ordem: this.ordenacao,
    };

    sinais[campo as keyof typeof sinais]?.set(valor);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [campo]: valor || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected limparFiltros(): void {
    this.filtros.limpar();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null, status: null, prioridade: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
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
        this.erro.set(
          'Não foi possível carregar as tarefas. Verifique se a API está funcionando.',
        );
        this.carregando.set(false);
      },
    });
  }

  protected mover(tarefa: Tarefa, status: string): void {
    if (
      this.salvando() ||
      tarefa.status === status ||
      !this.colunas.some((c) => c.id === status)
    ) {
      return;
    }

    const anterior = this.tarefas();

    this.salvando.set(true);
    this.erro.set('');

    this.tarefas.update((lista) =>
      lista.map((t) =>
        t.id === tarefa.id ? { ...t, status: status as Status } : t,
      ),
    );

    this.api.atualizarTarefa(tarefa.id, { status: status as Status }).subscribe({
      next: (salva) => {
        this.tarefas.update((lista) =>
          lista.map((t) => (t.id === salva.id ? salva : t)),
        );

        this.salvando.set(false);

        this.aviso.set(
          `“${tarefa.titulo}” movida para ${this.colunas
            .find((c) => c.id === status)
            ?.titulo.toLowerCase()}.`,
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
}
