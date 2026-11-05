import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';

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
const url = 'http://localhost:3000/tarefas/1';

describe('Exclusão de tarefa com confirmação', () => {
  let http: HttpTestingController;
  let confirmar: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    confirmar = vi.spyOn(window, 'confirm');
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });
  async function abrir() {
    const h = await RouterTestingHarness.create('/tarefas/1');
    TestBed.tick();
    http.expectOne(url).flush(tarefa);
    TestBed.tick();
    h.detectChanges();
    return h;
  }
  function botao(h: RouterTestingHarness) {
    return h.routeNativeElement!.querySelector<HTMLButtonElement>('.botao-perigo')!;
  }

  it('cancelar mantém a tarefa e não envia DELETE', async () => {
    const h = await abrir();
    confirmar.mockReturnValue(false);
    botao(h).click();
    expect(confirmar).toHaveBeenCalledWith(expect.stringContaining('Preparar entrega'));
    http.expectNone(url);
    expect(TestBed.inject(Router).url).toBe('/tarefas/1');
    expect(h.routeNativeElement?.textContent).toContain('Preparar entrega');
  });

  it('confirma, bloqueia envio duplicado e volta à lista atualizada após sucesso', async () => {
    const h = await abrir();
    confirmar.mockReturnValue(true);
    botao(h).click();
    TestBed.tick();
    h.detectChanges();
    expect(botao(h).disabled).toBe(true);
    expect(h.routeNativeElement?.querySelector('[role="status"]')?.textContent).toContain(
      'Excluindo',
    );
    botao(h).click();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await h.fixture.whenStable();
    TestBed.tick();
    http.expectOne('http://localhost:3000/tarefas').flush([]);
    http.expectOne('http://localhost:3000/projetos').flush([]);
    TestBed.tick();
    h.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/tarefas');
    expect(h.routeNativeElement?.querySelectorAll('app-tarefa-card')).toHaveLength(0);
    expect(h.routeNativeElement?.textContent).toContain('Nenhuma tarefa cadastrada');
  });

  it('mantém os dados após erro e permite confirmar uma nova tentativa', async () => {
    const h = await abrir();
    confirmar.mockReturnValue(true);
    botao(h).click();
    http.expectOne(url).flush({}, { status: 500, statusText: 'Error' });
    TestBed.tick();
    h.detectChanges();
    expect(h.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(
      'Não foi possível excluir',
    );
    expect(h.routeNativeElement?.textContent).toContain('Preparar entrega');
    expect(botao(h).disabled).toBe(false);
    expect(botao(h).textContent).toContain('Tentar excluir novamente');
    botao(h).click();
    expect(confirmar).toHaveBeenCalledTimes(2);
    http.expectOne(url).error(new ProgressEvent('error'));
  });
});
