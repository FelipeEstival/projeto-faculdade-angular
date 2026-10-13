import { ChangeDetectionStrategy, Component } from '@angular/core';

// Página provisória. A lista de projetos será implementada aqui.
@Component({
  selector: 'app-projetos',
  template: `
    <h1>Projetos</h1>
    <p>Em construção: a lista de projetos entra aqui.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projetos {}