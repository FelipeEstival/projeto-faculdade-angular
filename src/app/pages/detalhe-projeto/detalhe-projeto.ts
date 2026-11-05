import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, finalize, of, startWith, switchMap, tap } from 'rxjs';
import type { ProjetoComTarefas } from '../../services/projeto-com-tarefas';
import { TarefasService } from '../../services/tarefas.service';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';

@Component({
  selector: 'app-detalhe-projeto',
  imports: [RouterLink, TarefaCard],
  template: `
    <section aria-labelledby="titulo-projeto" [attr.aria-busy]="carregando()">
      <a routerLink="/projetos">← Voltar para projetos</a>
      <h1 id="titulo-projeto">{{ projeto()?.nome ?? 'Detalhe do projeto' }}</h1>
      @if (carregando()) {
        <p class="estado" role="status">Carregando projeto…</p>
      } @else if (erro()) {
        <p class="estado" role="alert">{{ erro() }}</p>
        <button type="button" (click)="recarregar.next()">Tentar novamente</button>
      } @else if (projeto(); as atual) {
        <p>{{ atual.descricao }}</p>
        <p><a [routerLink]="['/projetos', atual.id, 'editar']">Editar projeto</a></p>
        <button type="button" [disabled]="excluindo()" (click)="excluir(atual.id)">
          {{
            excluindo()
              ? 'Excluindo…'
              : erroExcluir()
                ? 'Tentar excluir novamente'
                : 'Excluir projeto'
          }}
        </button>
        @if (excluindo()) {
          <p role="status">Excluindo projeto…</p>
        }
        @if (erroExcluir()) {
          <p role="alert">{{ erroExcluir() }}</p>
        }
        <dl>
          <dt>ID</dt>
          <dd>{{ atual.id }}</dd>
          <dt>Disciplina</dt>
          <dd>{{ atual.disciplina }}</dd>
          <dt>Criado em</dt>
          <dd>{{ atual.criadoEm }}</dd>
        </dl>
        <h2>Tarefas do projeto</h2>
        <p>
          <a routerLink="/tarefas/nova" [queryParams]="{ projetoId: atual.id }"
            >Nova tarefa neste projeto</a
          >
        </p>
        <div class="tarefas-grid">
          @for (tarefa of atual.tarefas; track tarefa.id) {
            <app-tarefa-card [tarefa]="tarefa" />
          } @empty {
            <p class="estado" role="status">
              Este projeto ainda não possui tarefas. Adicione a primeira tarefa pelo link acima.
            </p>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './detalhe-projeto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheProjeto {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TarefasService);
  protected readonly projeto = signal<ProjetoComTarefas | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly excluindo = signal(false);
  protected readonly erroExcluir = signal('');

  protected readonly recarregar = new Subject<void>();

  constructor() {
    // A inscrição acompanha mudanças do id e cancela requisições anteriores.
    const dados = this.route.paramMap.pipe(
      switchMap((params) =>
        this.recarregar.pipe(
          startWith(undefined),
          switchMap(() => {
            this.carregando.set(true);
            this.erro.set('');
            this.erroExcluir.set('');
            this.projeto.set(null);
            const id = params.get('id');
            return id === null
              ? of(null)
              : this.api.getProjetoComTarefas(id).pipe(
                  catchError((erro: HttpErrorResponse) => {
                    this.erro.set(
                      erro.status === 404
                        ? 'Projeto não encontrado.'
                        : 'Não foi possível carregar o projeto. Verifique se a API está funcionando.',
                    );
                    return of(null);
                  }),
                );
          }),
        ),
      ),
      takeUntilDestroyed(),
    );
    afterNextRender(() =>
      dados.subscribe((projeto) => {
        this.carregando.set(false);
        this.projeto.set(projeto);
        if (!projeto && !this.erro()) this.erro.set('Projeto não encontrado.');
        if (!projeto) this.carregando.set(false);
      }),
    );
  }

  protected excluir(id: string): void {
    if (this.excluindo()) return;

    this.excluindo.set(true);
    this.erroExcluir.set('');
    this.api
      .excluirProjeto(id)
      .pipe(
        tap(() => void this.router.navigate(['/projetos'])),
        catchError(() => {
          this.erroExcluir.set('Não foi possível excluir o projeto. Tente novamente.');
          return EMPTY;
        }),
        finalize(() => this.excluindo.set(false)),
      )
      .subscribe();
  }
}
