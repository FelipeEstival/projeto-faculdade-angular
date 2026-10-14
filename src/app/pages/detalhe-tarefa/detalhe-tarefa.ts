import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Tarefa } from '../../../tipos';
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
      } @else if (tarefa()) {
        <p class="identificador">ID: {{ tarefa()!.id }}</p>
        <app-tarefa-card [tarefa]="tarefa()!" />
      }
    </section>
  `,
  styleUrl: './detalhe-tarefa.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheTarefa {
  private readonly route = inject(ActivatedRoute);
  private readonly tarefasService = inject(TarefasService);

  protected readonly tarefa = signal<Tarefa | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');

  constructor() {
    // Busca a tarefa no navegador para não chamar a API durante o prerender.
    afterNextRender(() => this.carregarTarefa());
  }

  private carregarTarefa(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id === null) {
      this.mensagemErro.set('Tarefa não encontrada.');
      this.carregando.set(false);
      return;
    }

    this.tarefasService.getPorId(id).subscribe({
      next: (tarefa) => {
        this.tarefa.set(tarefa);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemErro.set(
          erro.status === 404 ? 'Tarefa não encontrada.' : 'Não foi possível carregar a tarefa. Verifique se a API está funcionando.',
        );
        this.carregando.set(false);
      },
    });
  }
}
