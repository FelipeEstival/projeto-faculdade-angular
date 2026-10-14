import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Tarefa } from '../../../tipos';

@Component({
  selector: 'app-tarefa-card',
  imports: [RouterLink],
  templateUrl: './tarefa-card.html',
  styleUrl: './tarefa-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaCard {
  @Input({ required: true }) tarefa!: Tarefa;
}
