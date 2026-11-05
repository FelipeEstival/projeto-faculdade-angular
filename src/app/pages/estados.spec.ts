import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';

const projeto = {
  id: '1',
  nome: 'Projeto de teste',
  descricao: 'Descrição',
  disciplina: 'Frontend',
  criadoEm: '2026-10-01',
};
const tarefa = {
  id: '1',
  projetoId: '1',
  titulo: 'Preparar entrega',
  descricao: 'Descrição',
  status: 'a-fazer',
  prioridade: 'media',
  responsavel: 'Ana',
  prazo: '2026-11-10',
};
const api = 'http://localhost:3000';

const telas = [
  { rota: '/tarefas', recurso: '/tarefas', resposta: [tarefa] },
  { rota: '/quadro', recurso: '/tarefas', resposta: [tarefa] },
  { rota: '/projetos', recurso: '/projetos', resposta: [projeto] },
  { rota: '/tarefas/1', recurso: '/tarefas/1', resposta: tarefa },
  {
    rota: '/projetos/1',
    recurso: '/projetos/1?_embed=tarefas',
    resposta: { ...projeto, tarefas: [] },
  },
  { rota: '/tarefas/1/editar', recurso: '/tarefas/1', resposta: tarefa },
  { rota: '/projetos/1/editar', recurso: '/projetos/1', resposta: projeto },
  { rota: '/tarefas/nova', recurso: '/projetos', resposta: [projeto] },
];

describe('Estados de busca da API', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  for (const tela of telas) {
    it(`mostra carregamento, erro com API parada e nova tentativa em ${tela.rota}`, async () => {
      const h = await RouterTestingHarness.create(tela.rota);
      TestBed.tick();
      h.detectChanges();
      expect(h.routeNativeElement?.textContent).toContain('Carregando');
      const req = http.expectOne(api + tela.recurso);
      if (tela.recurso !== '/projetos')
        http.match(api + '/projetos').forEach((r) => r.flush([projeto]));
      req.error(new ProgressEvent('error'));
      TestBed.tick();
      h.detectChanges();
      expect(h.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(
        'Não foi possível',
      );
      expect(h.routeNativeElement?.textContent).not.toContain('Carregando');
      const retry = [...h.routeNativeElement!.querySelectorAll('button')].find((b) =>
        b.textContent?.includes('Tentar'),
      )!;
      expect(retry).toBeDefined();
      retry.click();
      TestBed.tick();
      h.detectChanges();
      expect(h.routeNativeElement?.textContent).toContain('Carregando');
      http.expectOne(api + tela.recurso).flush(tela.resposta);
      TestBed.tick();
      http.match(api + '/projetos').forEach((r) => r.flush([projeto]));
      await h.fixture.whenStable();
      h.detectChanges();
      expect(h.routeNativeElement?.querySelector('[role="alert"]')).toBeNull();
      expect(h.routeNativeElement?.textContent).not.toContain('Carregando');
    });
  }

  for (const recurso of ['tarefas', 'projetos']) {
    it(`mantém o indicador enquanto troca o id de ${recurso} com a primeira consulta pendente`, async () => {
      const h = await RouterTestingHarness.create(`/${recurso}/1`);
      TestBed.tick();
      const sufixo = recurso === 'projetos' ? '?_embed=tarefas' : '';
      const anterior = http.expectOne(`${api}/${recurso}/1${sufixo}`);
      await h.navigateByUrl(`/${recurso}/2`);
      TestBed.tick();
      h.detectChanges();
      expect(anterior.cancelled).toBe(true);
      expect(h.routeNativeElement?.textContent).toContain('Carregando');
      const resposta =
        recurso === 'projetos' ? { ...projeto, id: '2', tarefas: [] } : { ...tarefa, id: '2' };
      http.expectOne(`${api}/${recurso}/2${sufixo}`).flush(resposta);
      TestBed.tick();
      h.detectChanges();
      expect(h.routeNativeElement?.textContent).not.toContain('Carregando');
    });
  }

  it('permite recuperar os projetos do filtro sem recarregar as tarefas', async () => {
    const h = await RouterTestingHarness.create('/tarefas');
    TestBed.tick();
    http.expectOne(api + '/tarefas').flush([tarefa]);
    http.expectOne(api + '/projetos').error(new ProgressEvent('error'));
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(1);
    const retry = [...h.routeNativeElement!.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Tentar carregar projetos'),
    )!;
    retry.click();
    http.expectOne(api + '/projetos').flush([projeto]);
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.querySelector('[role="alert"]')).toBeNull();
    http.expectNone(api + '/tarefas');
  });

  it('diferencia nenhuma tarefa, projeto vazio e busca sem resultados', async () => {
    const h = await RouterTestingHarness.create('/tarefas');
    TestBed.tick();
    http.expectOne(api + '/projetos').flush([projeto]);
    http.expectOne(api + '/tarefas').flush([]);
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Nenhuma tarefa cadastrada');
    await h.navigateByUrl('/quadro?projetoId=2');
    TestBed.tick();
    http.match(api + '/projetos').forEach((r) => r.flush([projeto]));
    http.match(api + '/tarefas').forEach((r) => r.flush([tarefa]));
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Este projeto ainda não possui tarefas');
    await h.navigateByUrl('/quadro?q=inexistente');
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Nenhuma tarefa encontrada');
    expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(0);
    const limpar = [...h.routeNativeElement!.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Limpar busca'),
    )!;
    limpar.click();
    await h.fixture.whenStable();
    h.detectChanges();
    expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(1);
  });
});
