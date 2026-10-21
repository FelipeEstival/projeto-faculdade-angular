import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';

const projeto = { id: '1', nome: 'Projeto de teste', descricao: 'Descrição', disciplina: 'Frontend', criadoEm: '2026-10-01' };

describe('Rotas de projetos', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lista os projetos com link para seu detalhe', async () => {
    const harness = await RouterTestingHarness.create('/projetos');
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos').flush([projeto]);
    harness.detectChanges();
    expect(
      harness.routeNativeElement?.querySelector('a[href="/projetos/1"]')?.getAttribute('href')
    ).toBe('/projetos/1');
  });

  it('busca o projeto com embed e renderiza seu cartão de tarefa', async () => {
    const harness = await RouterTestingHarness.create('/projetos/1');
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos/1?_embed=tarefas').flush({ ...projeto, tarefas: [{ id: '1', projetoId: '1', titulo: 'Tarefa do projeto', descricao: '', status: 'a-fazer', prioridade: 'alta', responsavel: 'Ana', prazo: '2026-10-14' }] });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Projeto de teste');
    expect(harness.routeNativeElement?.querySelector('app-tarefa-card')?.textContent).toContain('Tarefa do projeto');
  });

  it('mostra mensagem para projeto inexistente', async () => {
    const harness = await RouterTestingHarness.create('/projetos/99');
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos/99?_embed=tarefas').flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Projeto não encontrado.');
  });

  it('mostra página não encontrada para uma URL desconhecida', async () => {
    const harness = await RouterTestingHarness.create('/endereco-inexistente');
    expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
  });
});
