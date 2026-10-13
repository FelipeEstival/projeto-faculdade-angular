import { ChangeDetectionStrategy, Component } from '@angular/core';

// Página provisória. O quadro kanban será implementado aqui.
@Component({
  selector: 'app-tarefas',
  template: `
    <h1>Tarefas</h1>
    <p>Em construção: o quadro kanban entra aqui.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tarefas {}