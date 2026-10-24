import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import type { NovaTarefa, Tarefa, Status } from '../../../tipos';
import { TarefaForm } from '../../components/tarefa-form/tarefa-form';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-formulario-tarefa',
  imports: [TarefaForm],
  template: `
    <section aria-labelledby="titulo-formulario">
      <h1 id="titulo-formulario">{{ id() ? 'Editar tarefa' : 'Nova tarefa' }}</h1>
      @if (carregando()) {
        <p role="status">Carregando tarefa…</p>
      } @else if (erroCarga()) {
        <p role="alert">{{ erroCarga() }}</p>
        <button type="button" (click)="cancelar()">Voltar para tarefas</button>
      } @else {
        @if (erroSalvar()) {
          <p role="alert">{{ erroSalvar() }}</p>
        }
        @if (enviando()) {
          <p role="status">Salvando tarefa…</p>
        }
        <app-tarefa-form
          [tarefa]="tarefa()"
          [projetoIdInicial]="projetoIdInicial"
          [statusInicial]="statusInicial"
          [enviando]="enviando()"
          (salvar)="salvar($event)"
          (cancelar)="cancelar()"
        />
      }
    </section>
  `,
  styleUrl: './formulario-tarefa.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioTarefa {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TarefasService);
  protected readonly id = signal<string | null>(null);
  protected readonly tarefa = signal<Tarefa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly erroCarga = signal('');
  protected readonly erroSalvar = signal('');
  protected readonly projetoIdInicial = this.route.snapshot.queryParamMap.get('projetoId') ?? '';

  protected readonly statusInicial: Status = (() => {
    const status = this.route.snapshot.queryParamMap.get('status');
    return ['a-fazer', 'em-andamento', 'em-revisao', 'concluida'].includes(status ?? '')
      ? (status as Status)
      : 'a-fazer';
  })();

  constructor() {
    const dados = this.route.paramMap.pipe(
      tap((params) => {
        this.id.set(params.get('id'));
        this.carregando.set(true);
        this.erroCarga.set('');
        this.erroSalvar.set('');
      }),
      switchMap((params) => {
        const id = params.get('id');
        return id
          ? this.api.getPorId(id).pipe(
              catchError((erro: HttpErrorResponse) => {
                this.erroCarga.set(
                  erro.status === 404
                    ? 'Tarefa não encontrada.'
                    : 'Não foi possível carregar a tarefa. Verifique se a API está funcionando.',
                );
                return of(null);
              }),
            )
          : of(null);
      }),
      takeUntilDestroyed(),
    );
    afterNextRender(() =>
      dados.subscribe((tarefa) => {
        this.tarefa.set(tarefa);
        this.carregando.set(false);
      }),
    );
  }

  protected salvar(dados: NovaTarefa): void {
    if (this.enviando() || this.carregando() || this.erroCarga()) return;
    this.enviando.set(true);
    this.erroSalvar.set('');
    const id = this.id();
    const requisicao = id ? this.api.atualizarTarefa(id, dados) : this.api.criarTarefa(dados);
    requisicao.subscribe({
      next: () => {
        void this.router.navigate(['/tarefas']);
      },
      error: () => {
        this.erroSalvar.set(
          'Não foi possível salvar a tarefa. Seus dados foram mantidos. Tente novamente.',
        );
        this.enviando.set(false);
      },
    });
  }

  protected cancelar(): void {
    if (!this.enviando()) void this.router.navigate(['/tarefas']);
  }
}
