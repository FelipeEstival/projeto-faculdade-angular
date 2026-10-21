import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import type { Tarefa } from '../../../tipos';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-tarefas',
  imports: [TarefaCard, RouterLink],
  template: `
    <section class="pagina-tarefas" aria-labelledby="titulo-tarefas">
      <header class="pagina-tarefas__cabecalho">
        <div>
          <p class="pagina-tarefas__sobretitulo">Organização</p>
          <h1 id="titulo-tarefas">Lista de tarefas</h1>
          <a routerLink="/tarefas/nova">Nova tarefa</a>
          <p class="pagina-tarefas__descricao">
            Acompanhe as tarefas e seus prazos em um só lugar.
          </p>
        </div>
        @if (!carregando()) {
          <span class="pagina-tarefas__total" aria-live="polite">
            {{ tarefas().length }} {{ tarefas().length === 1 ? 'tarefa' : 'tarefas' }}
          </span>
        }
      </header>

      @if (carregando()) {
        <p class="estado" role="status">Carregando tarefas…</p>
      } @else if (tarefas().length === 0) {
        <p class="estado">Nenhuma tarefa para exibir.</p>
      } @else {
        <div class="tarefas-grid" aria-label="Tarefas cadastradas">
          @for (tarefa of tarefas(); track tarefa.id) {
            <app-tarefa-card [tarefa]="tarefa" />
          }
        </div>
      }
    </section>
  `,
  styleUrl: './tarefas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tarefas {
  private readonly tarefasService = inject(TarefasService);

  protected readonly tarefas = signal<Tarefa[]>([]);
  protected readonly carregando = signal(true);

  constructor() {
    // A consulta ocorre no navegador, sem chamar a API durante o prerender SSR.
    afterNextRender(() => this.carregarTarefas());
  }

  protected carregarTarefas(): void {
    this.carregando.set(true);

    this.tarefasService.getTodas().subscribe({
      next: (tarefas) => {
        this.tarefas.set(tarefas);
        this.carregando.set(false);
      },
      error: () => {
        this.tarefas.set([]);
        this.carregando.set(false);
      },
    });
  }
}
