import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Icon } from '../icon';
import { RouterLink } from '@angular/router';
import type { Tarefa } from '../../../tipos';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-tarefa-card',
  imports: [RouterLink, DatePipe, Icon],
  templateUrl: './tarefa-card.html',
  styleUrl: './tarefa-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaCard {
  readonly statusLabels = {
    'a-fazer': 'A fazer',
    'em-andamento': 'Em andamento',
    'em-revisao': 'Em revisão',
    concluida: 'Concluída',
  };
  readonly prioridadeLabels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  iniciais(nome: string): string {
    return (
      nome
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?'
    );
  }
  @Input({ required: true }) tarefa!: Tarefa;
}
