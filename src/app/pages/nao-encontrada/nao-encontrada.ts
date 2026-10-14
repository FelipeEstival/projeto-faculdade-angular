import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  template: `<h1>Página não encontrada</h1><p>O endereço informado não existe.</p><a routerLink="/">Voltar para tarefas</a>`,
})
export class NaoEncontrada {}
