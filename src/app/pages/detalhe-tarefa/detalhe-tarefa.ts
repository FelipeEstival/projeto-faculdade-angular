import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import type { Tarefa } from '../../../tipos';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-detalhe-tarefa',
  imports: [TarefaCard, RouterLink],
  template: `
    <section class="pagina-detalhe" aria-labelledby="titulo-detalhe">
      <a class="voltar" routerLink="/tarefas">← Voltar para tarefas</a>
      <h1 id="titulo-detalhe">Detalhe da tarefa</h1>

      @if (carregando()) {
        <p class="estado" role="status">Carregando tarefa…</p>
      } @else if (mensagemErro()) {
        <p class="estado" role="alert">{{ mensagemErro() }}</p>
      } @else if (tarefa(); as atual) {
        <p class="identificador">ID: {{ atual.id }}</p>
        <app-tarefa-card [tarefa]="atual" />
        <a [routerLink]="['/tarefas', atual.id, 'editar']">Editar tarefa</a>
        <button type="button" [disabled]="excluindo()" (click)="excluir()">
          {{ excluindo() ? 'Excluindo…' : 'Excluir tarefa' }}
        </button>
        @if (erroExcluir()) {
          <p class="estado" role="alert">{{ erroExcluir() }}</p>
        }
      }
    </section>
  `,
  styleUrl: './detalhe-tarefa.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheTarefa {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tarefasService = inject(TarefasService);

  protected readonly tarefa = signal<Tarefa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly excluindo = signal(false);
  protected readonly erroExcluir = signal('');

  constructor() {
    const dados = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      tap(() => {
        this.carregando.set(true);
        this.mensagemErro.set('');
        this.tarefa.set(null);
      }),
      switchMap((id) =>
        id === null
          ? of(null)
          : this.tarefasService.getPorId(id).pipe(
              catchError((erro: HttpErrorResponse) => {
                this.mensagemErro.set(
                  erro.status === 404
                    ? 'Registro não encontrado: a tarefa solicitada não existe.'
                    : 'Não foi possível carregar a tarefa. Verifique se a API está funcionando.',
                );
                return of(null);
              }),
              finalize(() => this.carregando.set(false)),
            ),
      ),
      takeUntilDestroyed(),
    );

    // Evita chamadas à API durante o prerender no servidor.
    afterNextRender(() =>
      dados.subscribe((tarefa) => {
        this.tarefa.set(tarefa);
        if (!tarefa && !this.mensagemErro()) {
          this.mensagemErro.set('Registro não encontrado: tarefa não informada.');
          this.carregando.set(false);
        }
      }),
    );
  }

  protected excluir(): void {
    const tarefa = this.tarefa();
    if (!tarefa || this.excluindo()) return;

    this.excluindo.set(true);
    this.erroExcluir.set('');
    this.tarefasService
      .excluirTarefa(tarefa.id)
      .pipe(
        tap(() => void this.router.navigate(['/tarefas'])),
        catchError(() => {
          this.erroExcluir.set('Não foi possível excluir a tarefa. Tente novamente.');
          return EMPTY;
        }),
        finalize(() => this.excluindo.set(false)),
      )
      .subscribe();
  }
}
