import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Projeto } from '../../../tipos';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-projetos',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="titulo-projetos">
      <header class="cabecalho-projetos">
        <h1 id="titulo-projetos">Lista de projetos</h1>
        <a class="botao-novo-projeto" routerLink="/projetos/novo">Novo projeto</a>
      </header>

      @if (carregando()) {
        <p role="status">Carregando projetos...</p>
      } @else if (erro()) {
        <p role="alert">{{ erro() }}</p>
        <button type="button" (click)="carregar()">Tentar novamente</button>
      } @else {
        @for (projeto of projetos(); track projeto.id) {
          <article>
            <h2>
              <a [routerLink]="['/projetos', projeto.id]">
                {{ projeto.nome }}
              </a>
            </h2>

            <p>{{ projeto.descricao }}</p>
            <p>Disciplina: {{ projeto.disciplina }}</p>

            <a
              [routerLink]="['/projetos', projeto.id]"
              [attr.aria-label]="'Ver detalhes do projeto ' + projeto.nome"
            >
              Ver detalhes
            </a>
          </article>
        } @empty {
          <p>Nenhum projeto cadastrado.</p>
        }
      }
    </section>
  `,
  styleUrl: './projetos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projetos {
  private readonly api = inject(TarefasService);

  protected readonly projetos = signal<Projeto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  constructor() {
    afterNextRender(() => this.carregar());
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.api.getTodosProjetos().subscribe({
      next: (projetos) => {
        this.projetos.set(projetos);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(
          'Não foi possível carregar os projetos. Verifique se a API está funcionando.',
        );
        this.carregando.set(false);
      },
    });
  }
}
