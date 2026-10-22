import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { routes } from '../../app.routes';
import { TarefaForm } from '../../components/tarefa-form/tarefa-form';

const dados = { projetoId: '2', titulo: 'Minha tarefa', descricao: 'Descrição', status: 'a-fazer' as const, prioridade: 'alta' as const, responsavel: 'Kaio', prazo: '2026-10-25' };
const projeto = { id: '2', nome: 'Projeto 2', descricao: '', disciplina: 'Frontend', criadoEm: '2026-10-01' };

describe('Criação e edição de tarefas', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function abrir(url: string) {
    const harness = await RouterTestingHarness.create(url);
    TestBed.tick();
    return harness;
  }

  it('abre nova antes da rota por id e pré-seleciona o projeto', async () => {
    const h = await abrir('/tarefas/nova?projetoId=2');
    http.expectOne('http://localhost:3000/projetos').flush([projeto]);
    TestBed.tick();
    await h.fixture.whenStable();
    expect((h.routeNativeElement?.querySelector('[name="projetoId"]') as HTMLSelectElement).value).toBe('2');
    expect((h.routeNativeElement?.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('faz POST sem id, bloqueia envio repetido e volta para a lista', async () => {
    const h = await abrir('/tarefas/nova');
    http.expectOne('http://localhost:3000/projetos').flush([projeto]);
    const form = h.routeDebugElement!.query(By.directive(TarefaForm)).componentInstance as TarefaForm;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    form.salvar.emit(dados);
    form.salvar.emit(dados);
    h.detectChanges();
    const req = http.expectOne('http://localhost:3000/tarefas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dados);
    expect(form.enviando).toBe(true);
    req.flush({ ...dados, id: 'nova' });
    expect(navegar).toHaveBeenCalledWith(['/tarefas']);
  });

  it('carrega os valores da edição e faz PATCH no id correto', async () => {
    const h = await abrir('/tarefas/7/editar');
    http.expectOne('http://localhost:3000/tarefas/7').flush({ ...dados, id: '7' });
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos').flush([projeto]);
    TestBed.tick();
    await h.fixture.whenStable();
    expect((h.routeNativeElement?.querySelector('[name="titulo"]') as HTMLInputElement).value).toBe(dados.titulo);
    const form = h.routeDebugElement!.query(By.directive(TarefaForm)).componentInstance as TarefaForm;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    form.salvar.emit({ ...dados, titulo: 'Alterada' });
    const req = http.expectOne('http://localhost:3000/tarefas/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.titulo).toBe('Alterada');
    req.flush({ ...dados, id: '7', titulo: 'Alterada' });
  });

  it('mostra 404 sem apresentar formulário vazio', async () => {
    const h = await abrir('/tarefas/99/editar');
    http.expectOne('http://localhost:3000/tarefas/99').flush({}, { status: 404, statusText: 'Not Found' });
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Tarefa não encontrada.');
    expect(h.routeNativeElement?.querySelector('app-tarefa-form')).toBeNull();
  });

  it('preserva o formulário e permite tentar novamente após erro ao salvar', async () => {
    const h = await abrir('/tarefas/nova');
    http.expectOne('http://localhost:3000/projetos').flush([projeto]);
    const form = h.routeDebugElement!.query(By.directive(TarefaForm)).componentInstance as TarefaForm;
    form.salvar.emit(dados);
    http.expectOne('http://localhost:3000/tarefas').flush({}, { status: 500, statusText: 'Error' });
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Seus dados foram mantidos');
    expect(form.enviando).toBe(false);
    form.salvar.emit(dados);
    http.expectOne('http://localhost:3000/tarefas').flush({}, { status: 500, statusText: 'Error' });
  });
});
