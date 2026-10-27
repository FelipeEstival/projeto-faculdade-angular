import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FiltrosTarefasService {
  readonly busca = signal('');
  readonly projetoId = signal('');
  readonly prioridade = signal('');
  readonly status = signal('');
  readonly ordenacao = signal('manual');

  limpar(): void {
    this.busca.set('');
    this.prioridade.set('');
    this.status.set('');
  }
}
