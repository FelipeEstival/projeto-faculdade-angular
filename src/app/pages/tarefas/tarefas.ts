import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Tarefa } from '../../../tipos';
import { TarefaCard } from '../../components/tarefa-card/tarefa-card';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-tarefas',
  imports: [TarefaCard],
  template: `
    <section class="pagina-tarefas" aria-labelledby="titulo-tarefas">
      <header class="pagina-tarefas__cabecalho">
        <div>
          <p class="pagina-tarefas__sobretitulo">Organização</p>
          <h1 id="titulo-tarefas">Lista de tarefas</h1>
          <p class="pagina-tarefas__descricao">
            Acompanhe as tarefas e seus prazos em um só lugar.
          </p>
        </div>
        @if (!carregando() && !erro()) {
          <span class="pagina-tarefas__total" aria-live="polite">
            {{ tarefas().length }} {{ tarefas().length === 1 ? 'tarefa' : 'tarefas' }}
          </span>
        }
      </header>

      @if (carregando()) {
        <p class="estado" role="status">Carregando tarefas…</p>
      } @else if (erro()) {
        <div class="estado estado--erro" role="alert">
          <h2>Não foi possível carregar as tarefas</h2>
          <p>Verifique a conexão com a API e tente novamente.</p>
          <button class="botao-tentar-novamente" type="button" (click)="carregarTarefas()">
            Tentar novamente
          </button>
        </div>
      } @else if (tarefas().length === 0) {
        <p class="estado">Ainda não há tarefas cadastradas.</p>
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
  protected readonly erro = signal(false);

  constructor() {
    // A consulta ocorre no navegador, sem chamar a API durante o prerender SSR.
    afterNextRender(() => this.carregarTarefas());
  }

  protected carregarTarefas(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.tarefasService.getTodas().subscribe({
      next: (tarefas) => {
        this.tarefas.set(tarefas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
