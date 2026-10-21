import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import type { ProjetoComTarefas } from '../../services/projeto-com-tarefas';
import { TarefasService } from '../../services/tarefas.service';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';

@Component({
  selector: 'app-detalhe-projeto',
  imports: [RouterLink, TarefaCard],
  template: `
    <section aria-labelledby="titulo-projeto">
      <a routerLink="/projetos">← Voltar para projetos</a>
      <h1 id="titulo-projeto">{{ projeto()?.nome ?? 'Detalhe do projeto' }}</h1>
      @if (carregando()) {
        <p role="status">Carregando projeto…</p>
      } @else if (erro()) {
        <p role="alert">{{ erro() }}</p>
      } @else if (projeto(); as atual) {
        <p>{{ atual.descricao }}</p>
        <p><a [routerLink]="['/projetos', atual.id, 'editar']">Editar projeto</a></p>
        <dl>
          <dt>ID</dt><dd>{{ atual.id }}</dd>
          <dt>Disciplina</dt><dd>{{ atual.disciplina }}</dd>
          <dt>Criado em</dt><dd>{{ atual.criadoEm }}</dd>
        </dl>
        <h2>Tarefas do projeto</h2>
        <div class="tarefas-grid">
          @for (tarefa of atual.tarefas; track tarefa.id) {
            <app-tarefa-card [tarefa]="tarefa" />
          } @empty {
            <p>Este projeto ainda não possui tarefas.</p>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .tarefas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1rem; }
    dt { font-weight: 600; } dd { margin: 0 0 1rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheProjeto {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(TarefasService);
  protected readonly projeto = signal<ProjetoComTarefas | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  constructor() {
    // A inscrição acompanha mudanças do id e cancela requisições anteriores.
    const dados = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      tap(() => { this.carregando.set(true); this.erro.set(''); this.projeto.set(null); }),
      switchMap((id) => id === null ? of(null) : this.api.getProjetoComTarefas(id).pipe(
        catchError((erro: HttpErrorResponse) => {
          this.erro.set(erro.status === 404 ? 'Projeto não encontrado.' : 'Não foi possível carregar o projeto. Verifique se a API está funcionando.');
          return of(null);
        }),
      )),
      takeUntilDestroyed(),
    );
    afterNextRender(() => dados.subscribe((projeto) => {
      this.projeto.set(projeto);
      if (!projeto && !this.erro()) this.erro.set('Projeto não encontrado.');
      this.carregando.set(false);
    }));
  }
}
