import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { routes } from '../../app.routes';
import type { Tarefa } from '../../../tipos';

const tarefas: Tarefa[] = ['a-fazer','em-andamento','em-revisao','concluida'].map((status,i)=>({
 id: String(i+1), projetoId:'1', titulo:'Pesquisar '+i, descricao:'Teste', status:status as Tarefa['status'], prioridade:'alta', responsavel:'Ana', prazo:'2026-11-01',
}));

describe('Alternância entre lista e quadro', () => {
 let http: HttpTestingController;
 beforeEach(()=>{
  TestBed.configureTestingModule({providers:[provideRouter(routes),provideHttpClient(),provideHttpClientTesting()]});
  http=TestBed.inject(HttpTestingController);
 });
 afterEach(()=>http.verify());
 function responder(){
  TestBed.tick();
  http.match('http://localhost:3000/projetos').forEach(r=>r.flush([]));
  http.match('http://localhost:3000/tarefas').forEach(r=>r.flush(tarefas));
  TestBed.tick();
 }
 it('abre lista na rota inicial e quadro com quatro colunas na rota /quadro',async()=>{
  const h=await RouterTestingHarness.create('/');responder();h.detectChanges();
  expect(h.routeNativeElement?.querySelector('.task-list')).not.toBeNull();
  expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(4);
  await h.navigateByUrl('/quadro');responder();h.detectChanges();
  expect(h.routeNativeElement?.querySelectorAll('.kanban-column')).toHaveLength(4);
  const colunas=h.routeNativeElement!.querySelectorAll('.kanban-column');
  colunas.forEach((c,i)=>expect(c.querySelector('app-tarefa-card')?.textContent).toContain('Pesquisar '+i));
 });
 it('preserva busca, projeto, prioridade, status e ordenação nas duas direções',async()=>{
  const query='q=Pesquisar&projetoId=1&prioridade=alta&status=em-revisao&ordem=prazo';
  const h=await RouterTestingHarness.create('/tarefas?'+query);responder();h.detectChanges();
  const quadro=h.routeNativeElement!.querySelector('a[href^="/quadro"]') as HTMLAnchorElement;
  expect(quadro).not.toBeNull();
  await h.navigateByUrl(quadro.getAttribute('href')!);responder();h.detectChanges();
  expect(TestBed.inject(Router).url).toContain('status=em-revisao');
  expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(1);
  expect(h.routeNativeElement?.querySelector('app-tarefa-card')?.textContent).toContain('Pesquisar 2');
  const lista=h.routeNativeElement!.querySelector('.view-switch a[href^="/tarefas"]')!;
  await h.navigateByUrl(lista.getAttribute('href')!);responder();h.detectChanges();
  for(const [key,value] of new URLSearchParams(query))expect(TestBed.inject(Router).parseUrl(TestBed.inject(Router).url).queryParams[key]).toBe(value);
  expect(h.routeNativeElement?.querySelector('.task-list')).not.toBeNull();
  expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(1);
 });
 it('grava uma busca alterada na URL e mantém ao trocar para quadro',async()=>{
  const h=await RouterTestingHarness.create('/tarefas');responder();h.detectChanges();
  const input=h.routeNativeElement!.querySelector('input[type="search"]') as HTMLInputElement;
  input.value='Pesquisar 1'; input.dispatchEvent(new Event('input'));
  await h.fixture.whenStable();h.detectChanges();
  expect(TestBed.inject(Router).parseUrl(TestBed.inject(Router).url).queryParams['q']).toBe('Pesquisar 1');
  const link=h.routeNativeElement!.querySelector('a[href^="/quadro"]')!;
  await h.navigateByUrl(link.getAttribute('href')!);responder();h.detectChanges();
  expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(1);
  expect((h.routeNativeElement?.querySelector('input[type="search"]') as HTMLInputElement).value).toBe('Pesquisar 1');
 });
 it('mostra colunas vazias quando a busca não encontra resultados',async()=>{
  const h=await RouterTestingHarness.create('/quadro?q=inexistente');responder();h.detectChanges();
  expect(h.routeNativeElement?.textContent).toContain('Nenhuma tarefa encontrada');
  expect(h.routeNativeElement?.querySelectorAll('.kanban-column')).toHaveLength(4);
  expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(0);
 });
});
