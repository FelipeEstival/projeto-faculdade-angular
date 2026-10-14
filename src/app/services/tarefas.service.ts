import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { Projeto, Tarefa } from '../../tipos';
import type { ProjetoComTarefas } from './projeto-com-tarefas';

export const API_URL = 'http://localhost:3000';
export const TAREFAS_API_URL = `${API_URL}/tarefas`;
export const PROJETOS_API_URL = `${API_URL}/projetos`;

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private readonly http = inject(HttpClient);

  getTodas(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(TAREFAS_API_URL);
  }

  getPorId(id: string): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${TAREFAS_API_URL}/${id}`);
  }

  getTodosProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(PROJETOS_API_URL);
  }

  getProjetoPorId(id: string): Observable<Projeto> {
    return this.http.get<Projeto>(`${PROJETOS_API_URL}/${id}`);
  }

  getProjetoComTarefas(id: string): Observable<ProjetoComTarefas> {
    return this.http.get<ProjetoComTarefas>(`${PROJETOS_API_URL}/${id}?_embed=tarefas`);
  }
}
