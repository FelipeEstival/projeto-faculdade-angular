import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { Tarefas } from './tarefas';
import type { Projeto, Tarefa } from '../../../tipos';

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
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function abrir(tarefas = [tarefa, outra], falha = false, projetos: Projeto[] = []) {
    const fixture = TestBed.createComponent(Tarefas);
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne('http://localhost:3000/projetos').flush(projetos);
    const req = http.expectOne('http://localhost:3000/tarefas');
    if (falha) req.flush({}, { status: 500, statusText: 'Error' });
    else req.flush(tarefas);
    fixture.detectChanges();
    return fixture;
  }
  it('distingue falha da API de um quadro vazio e permite repetir', () => {
    const fixture = abrir([], true);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
    fixture.nativeElement.querySelector('.error button').click();
    http.expectOne('http://localhost:3000/tarefas').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma tarefa para exibir.');
    expect(fixture.nativeElement.querySelectorAll('.column-list')).toHaveLength(4);
  });
  it('busca por parte do título ignorando caixa e espaços nas extremidades', () => {
    const fixture = abrir();
    const input = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = '  FORMULÁRIO  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('app-tarefa-card').textContent).toContain(
      'Construir formulário',
    );
    expect(fixture.nativeElement.querySelectorAll('.column-count')[0].textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelectorAll('.column-count')[1].textContent.trim()).toBe('1');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(2);
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(2);
  });
  it.each(['Bruno', 'referências'])(
    'não retorna tarefas quando "%s" aparece apenas no responsável ou na descrição',
    (termo) => {
      const fixture = abrir();
      const input = fixture.nativeElement.querySelector('input[type="search"]');
      input.value = termo;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(0);
      expect(fixture.nativeElement.textContent).toContain(
        'Nenhuma tarefa encontrada para os filtros selecionados.',
      );
      expect(fixture.nativeElement.textContent).not.toContain('Nenhuma tarefa para exibir.');
      input.value = '';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(2);
    },
  );
  it('combina busca por título com projeto, prioridade e ordenação', () => {
    const fixture = abrir(
      [
        tarefa,
        { ...outra, titulo: 'Pesquisar componentes' },
        { ...tarefa, id: '3', projetoId: '2', titulo: 'Pesquisar requisitos' },
        { ...tarefa, id: '4', titulo: 'Pesquisar API', prazo: '2026-10-20' },
      ],
      false,
      [{ id: '1', nome: 'Codadores', descricao: '', disciplina: '', criadoEm: '2026-10-01' }],
    );
    fixture.nativeElement.querySelector('.glass-pill').click();
    fixture.detectChanges();
    const projeto = fixture.nativeElement.querySelector('[aria-label="Selecionar projeto"]');
    projeto.value = '1';
    projeto.dispatchEvent(new Event('change'));
    const input = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = 'Pesquisar';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('.filter-button').click();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('[aria-label="Filtrar por prioridade"]');
    select.value = 'alta';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const ordem = fixture.nativeElement.querySelector('[aria-label="Ordenar tarefas"]');
    ordem.value = 'prazo';
    ordem.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-tarefa-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Pesquisar API');
    expect(cards[1].textContent).toContain('Pesquisar interface');
    input.value = 'inexistente';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(0);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-tarefa-card')).toHaveLength(2);
  });
  it('persiste o status ao soltar em outra coluna', () => {
    const fixture = abrir();
    const listas = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const destino = listas[3].injector.get(CdkDropList);
    destino.dropped.emit({
      item: { data: tarefa },
      container: destino,
      previousContainer: listas[0].injector.get(CdkDropList),
      previousIndex: 0,
      currentIndex: 0,
    } as any);
    const req = http.expectOne('http://localhost:3000/tarefas/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'concluida' });
    req.flush({ ...tarefa, status: 'concluida' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kanban-column')[3].textContent).toContain(
      'Pesquisar interface',
    );
    expect(
      fixture.nativeElement.querySelectorAll('.kanban-column')[0].querySelector('app-tarefa-card'),
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
    expect(fixture.nativeElement.querySelectorAll('.kanban-column')[0].textContent).toContain(
      'Pesquisar interface',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'voltou à coluna anterior',
    );
    expect(
      fixture.nativeElement.querySelector('[aria-label="Mover tarefa Pesquisar interface"]')
        .disabled,
    ).toBe(false);
  });
});
