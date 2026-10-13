import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface ItemMenu {
  label: string;
  caminho: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // Para adicionar uma nova opção no menu, basta incluir um item aqui
  // (e a rota correspondente em app.routes.ts).
  protected readonly itensMenu: readonly ItemMenu[] = [
    { label: 'Tarefas', caminho: '/tarefas' },
    { label: 'Projetos', caminho: '/projetos' },
  ];
}