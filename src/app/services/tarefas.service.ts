
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  NovoProjeto,
  NovaTarefa,
  Projeto,
  Tarefa,
} from '../../tipos';
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
    return this.http.get<ProjetoComTarefas>(
      `${PROJETOS_API_URL}/${id}?_embed=tarefas`
    );
  }

  criarTarefa(dados: NovaTarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(TAREFAS_API_URL, dados);
  }

  atualizarTarefa(
    id: string,
    dados: Partial<NovaTarefa>
  ): Observable<Tarefa> {
    return this.http.patch<Tarefa>(
      `${TAREFAS_API_URL}/${id}`,
      dados
    );
  }

  criarProjeto(dados: NovoProjeto): Observable<Projeto> {
    return this.http.post<Projeto>(PROJETOS_API_URL, dados);
  }

  atualizarProjeto(
    id: string,
    dados: Partial<NovoProjeto>
  ): Observable<Projeto> {
    return this.http.patch<Projeto>(
      `${PROJETOS_API_URL}/${id}`,
      dados
    );
  }
}
