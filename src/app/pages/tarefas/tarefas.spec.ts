
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Tarefas } from './tarefas';
import type { Tarefa } from '../../../tipos';

const tarefa: Tarefa = {
  id: '1',
  projetoId: '1',
  titulo: 'Pesquisar interface',
  descricao: 'Revisar referências',
  status: 'a-fazer',
  prioridade: 'alta',
  responsavel: 'Ana',
  prazo: '2026-10-25',
};

const outra: Tarefa = {
  ...tarefa,
  id: '2',
  titulo: 'Construir formulário',
  status: 'em-andamento',
  prioridade: 'baixa',
  responsavel: 'Bruno',
};

describe('Quadro Kanban', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Tarefas],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function abrir(tarefas = [tarefa, outra], falha = false) {
    const fixture = TestBed.createComponent(Tarefas);

    fixture.detectChanges();
    TestBed.tick();

    http.expectOne('http://localhost:3000/projetos').flush([]);

    const req = http.expectOne('http://localhost:3000/tarefas');

    if (falha) {
      req.flush({}, { status: 500, statusText: 'Error' });
    } else {
      req.flush(tarefas);
    }

    fixture.detectChanges();

    return fixture;
  }

  it('distingue falha da API de um quadro vazio e permite repetir', () => {
    const fixture = abrir([], true);

    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent,
    ).toContain('Não foi possível carregar');

    fixture.nativeElement.querySelector('.error button').click();

    http.expectOne('http://localhost:3000/tarefas').flush([]);

    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[role="alert"]'),
    ).toBeNull();

    expect(fixture.nativeElement.textContent).toContain(
      'Nenhuma tarefa para exibir.',
    );

    expect(
      fixture.nativeElement.querySelectorAll('.column-list'),
    ).toHaveLength(4);
  });

  it('busca somente pelo título e filtra por prioridade', () => {
    const fixture = abrir();

    const input = fixture.nativeElement.querySelector(
      'input[type="search"]',
    );

    input.value = 'Construir';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('app-tarefa-card'),
    ).toHaveLength(1);

    expect(
      fixture.nativeElement.querySelector('app-tarefa-card').textContent,
    ).toContain('Construir formulário');

    input.value = 'Bruno';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('app-tarefa-card'),
    ).toHaveLength(0);

    input.value = '';
    input.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('.filter-button').click();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector(
      '[aria-label="Filtrar por prioridade"]',
    );

    select.value = 'alta';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('app-tarefa-card'),
    ).toHaveLength(1);

    expect(
      fixture.nativeElement.querySelector('app-tarefa-card').textContent,
    ).toContain('Pesquisar interface');
  });

  it('persiste o status ao mudar pelo seletor', () => {
    const fixture = abrir();

    const select = fixture.nativeElement.querySelector(
      '[aria-label="Mover tarefa Pesquisar interface"]',
    );

    select.value = 'concluida';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const req = http.expectOne('http://localhost:3000/tarefas/1');

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'concluida' });

    req.flush({ ...tarefa, status: 'concluida' });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.kanban-column')[3].textContent,
    ).toContain('Pesquisar interface');

    expect(
      fixture.nativeElement.querySelectorAll('.kanban-column')[0]
        .querySelector('app-tarefa-card'),
    ).toBeNull();
  });

  it('restaura a coluna original se a atualização falhar', () => {
    const fixture = abrir();

    const select = fixture.nativeElement.querySelector(
      '[aria-label="Mover tarefa Pesquisar interface"]',
    );

    select.value = 'concluida';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    http
      .expectOne('http://localhost:3000/tarefas/1')
      .flush({}, { status: 500, statusText: 'Error' });

    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.kanban-column')[0].textContent,
    ).toContain('Pesquisar interface');

    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent,
    ).toContain('voltou à coluna anterior');

    expect(
      fixture.nativeElement.querySelector(
        '[aria-label="Mover tarefa Pesquisar interface"]',
      ).disabled,
    ).toBe(false);
  });
});
