import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarefa } from '../../tipos';

/**
 * Endereço esperado para a API REST local.
 * Ajuste para o endereço informado pela professora/servidor do projeto, se necessário.
 */
export const TAREFAS_API_URL = 'http://localhost:3000/tarefas';

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private readonly http = inject(HttpClient);

  getTodas(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(TAREFAS_API_URL);
  }
}
