import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';

const projeto = {
  id: '1',
  nome: 'Projeto de teste',
  descricao: 'Descrição do projeto',
  disciplina: 'Engenharia de Software',
  criadoEm: '2026-10-01',
};

describe('Formulário de projeto', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('abre o formulário de criação em /projetos/novo', async () => {
    const harness = await RouterTestingHarness.create('/projetos/novo');
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Novo projeto');
    expect(harness.routeNativeElement?.querySelector('app-projeto-form')).not.toBeNull();
    http.expectNone('http://localhost:3000/projetos');
  });

  it('carrega os dados do projeto na rota de edição', async () => {
    const harness = await RouterTestingHarness.create('/projetos/1/editar');
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos/1').flush(projeto);
    await harness.fixture.whenStable();
    harness.detectChanges();

    const tela = harness.routeNativeElement as HTMLElement;
    expect(tela.querySelector('h1')?.textContent).toContain('Editar projeto');
    expect((tela.querySelector('[name="nome"]') as HTMLInputElement).value).toBe(
      'Projeto de teste',
    );
    expect((tela.querySelector('[name="disciplina"]') as HTMLInputElement).value).toBe(
      'Engenharia de Software',
    );
  });

  it('mostra mensagem de projeto não encontrado quando a API responde 404', async () => {
    const harness = await RouterTestingHarness.create('/projetos/404/editar');
    TestBed.tick();
    http
      .expectOne('http://localhost:3000/projetos/404')
      .flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(
      'Projeto não encontrado.',
    );
  });
});
