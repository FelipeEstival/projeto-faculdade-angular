import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon';
import type { Projeto } from '../../../tipos';

@Component({
  selector: 'app-board-header',
  imports: [RouterLink, Icon],
  templateUrl: './board-header.html',
  styleUrl: './board-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardHeader {
  readonly projetoAtual = input<Projeto>();
  readonly projetos = input<Projeto[]>([]);
  readonly projetoId = input('');
  readonly total = input(0);
  readonly concluidas = input(0);
  readonly progresso = input(0);
  readonly selecionarProjeto = output<string>();
  protected readonly escolherProjeto = signal(false);
}
