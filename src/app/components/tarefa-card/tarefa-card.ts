import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Tarefa } from '../../../tipos';

@Component({
  selector: 'app-tarefa-card',
  templateUrl: './tarefa-card.html',
  styleUrl: './tarefa-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaCard {
  @Input({ required: true }) tarefa!: Tarefa;
}
