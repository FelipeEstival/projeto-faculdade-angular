import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { DadosProjeto, NovoProjeto, Projeto } from '../../../tipos';
import { ProjetoForm } from '../../components/projeto-form/projeto-form';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-formulario-projeto-page',
  imports: [RouterLink, ProjetoForm],
  template: `
    <section class="pagina-formulario-projeto" aria-labelledby="titulo-formulario-projeto">
      <a class="voltar" routerLink="/projetos">← Voltar para projetos</a>
      <header>
        <p class="sobretitulo">Projetos</p>
        <h1 id="titulo-formulario-projeto">{{ editando ? 'Editar projeto' : 'Novo projeto' }}</h1>
        <p class="descricao">
          {{
            editando
              ? 'Atualize as informações deste projeto.'
              : 'Cadastre um projeto para organizar suas tarefas.'
          }}
        </p>
      </header>

      @if (carregando()) {
        <p class="estado" role="status">Carregando projeto…</p>
      } @else if (erroCarregamento()) {
        <p class="estado erro" role="alert">{{ erroCarregamento() }}</p>
        <a routerLink="/projetos">Ir para a lista de projetos</a>
      } @else {
        @if (erroSalvamento()) {
          <p class="estado erro" role="alert">{{ erroSalvamento() }}</p>
        }
        <app-projeto-form
          [projeto]="projeto()"
          [enviando]="salvando()"
          (salvar)="salvar($event)"
          (cancelar)="cancelar()"
        />
      }
    </section>
  `,
  styleUrl: './formulario-projeto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioProjeto {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TarefasService);
  private readonly projetoId = this.route.snapshot.paramMap.get('id');

  protected readonly editando = this.projetoId !== null;
  protected readonly projeto = signal<Projeto | null>(null);
  protected readonly carregando = signal(this.editando);
  protected readonly salvando = signal(false);
  protected readonly erroCarregamento = signal('');
  protected readonly erroSalvamento = signal('');

  constructor() {
    if (this.projetoId !== null) {
      afterNextRender(() => this.carregarProjeto(this.projetoId!));
    }
  }

  protected salvar(dados: DadosProjeto): void {
    if (this.salvando()) {
      return;
    }

    this.salvando.set(true);
    this.erroSalvamento.set('');

    const requisicao =
      this.projetoId === null
        ? this.api.criarProjeto({ ...dados, criadoEm: this.dataLocal() } satisfies NovoProjeto)
        : this.api.atualizarProjeto(this.projetoId, dados);

    requisicao.subscribe({
      next: (projeto) => {
        void this.router.navigate(['/projetos', projeto.id]);
      },
      error: (erro: HttpErrorResponse) => {
        this.erroSalvamento.set(
          erro.status === 404
            ? 'Projeto não encontrado. Volte à lista e tente novamente.'
            : 'Não foi possível salvar o projeto. Verifique se a API está funcionando.',
        );
        this.salvando.set(false);
      },
    });
  }

  protected cancelar(): void {
    if (this.projetoId !== null) {
      void this.router.navigate(['/projetos', this.projetoId]);
      return;
    }

    void this.router.navigate(['/projetos']);
  }

  private carregarProjeto(id: string): void {
    this.api.getProjetoPorId(id).subscribe({
      next: (projeto) => {
        this.projeto.set(projeto);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.erroCarregamento.set(
          erro.status === 404
            ? 'Projeto não encontrado.'
            : 'Não foi possível carregar o projeto. Verifique se a API está funcionando.',
        );
        this.carregando.set(false);
      },
    });
  }

  private dataLocal(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${hoje.getFullYear()}-${mes}-${dia}`;
  }
}
