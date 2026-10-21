
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
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
        <button type="button" (click)="carregar()">
          Tentar novamente
        </button>
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
  styles: `
    .cabecalho-projetos { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    .cabecalho-projetos h1 { margin: 0; }
    .botao-novo-projeto { padding: 0.65rem 1rem; color: white; background: var(--cor-primaria); border-radius: 6px; font-weight: 600; text-decoration: none; }
    .botao-novo-projeto:hover { filter: brightness(0.94); }
    article {
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    article h2 {
      margin-top: 0;
    }

    article a {
      color: #2457a7;
    }
  `,
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
          'Não foi possível carregar os projetos. Verifique se a API está funcionando.'
        );
        this.carregando.set(false);
      },
    });
  }
}
