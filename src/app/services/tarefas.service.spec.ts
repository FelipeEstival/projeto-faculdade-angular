import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import type { Tarefa } from '../../tipos';
import { TAREFAS_API_URL, TarefasService } from './tarefas.service';

describe('TarefasService', () => {
  let httpTesting: HttpTestingController;
  let service: TarefasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TarefasService);
  });

  afterEach(() => httpTesting.verify());

  it('busca todas as tarefas com uma requisição GET', () => {
    const tarefas: Tarefa[] = [
      {
        id: '1',
        projetoId: '1',
        descricao: 'Preparar apresentação do marco',
        titulo: 'Preparar apresentação',
        status: 'a-fazer',
        prioridade: 'alta',
        responsavel: 'Estudante',
        prazo: '2026-10-20',
      },
    ];
    let resposta: Tarefa[] | undefined;

    service.getTodas().subscribe((resultado) => (resposta = resultado));

    const requisicao = httpTesting.expectOne(TAREFAS_API_URL);
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(tarefas);

    expect(resposta).toEqual(tarefas);
  });

  it('busca uma tarefa pelo ID com uma requisição GET', () => {
    const tarefa: Tarefa = {
      id: '2',
      projetoId: '1',
      descricao: 'Revisar o conteúdo de Angular',
      titulo: 'Estudar Angular',
      status: 'a-fazer',
      prioridade: 'media',
      responsavel: 'Estudante',
      prazo: '2026-10-21',
    };
    let resposta: Tarefa | undefined;

    service.getPorId('2').subscribe((resultado) => (resposta = resultado));

    const requisicao = httpTesting.expectOne(`${TAREFAS_API_URL}/2`);
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(tarefa);

    expect(resposta).toEqual(tarefa);
  });

});
