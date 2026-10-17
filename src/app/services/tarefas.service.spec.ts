
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import type {
  NovoProjeto,
  NovaTarefa,
  Projeto,
  Tarefa,
} from '../../tipos';

import type { ProjetoComTarefas } from './projeto-com-tarefas';

import {
  PROJETOS_API_URL,
  TAREFAS_API_URL,
  TarefasService,
} from './tarefas.service';

describe('TarefasService', () => {
  let httpTesting: HttpTestingController;
  let service: TarefasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TarefasService);
  });

  afterEach(() => httpTesting.verify());

  // TESTES DE CONSULTA

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

    service.getTodas().subscribe((resultado) => {
      resposta = resultado;
    });

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

    service.getPorId('2').subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(
      `${TAREFAS_API_URL}/2`
    );

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(tarefa);

    expect(resposta).toEqual(tarefa);
  });

  it('lista projetos com uma requisição GET', () => {
    const projetos: Projeto[] = [
      {
        id: '1',
        nome: 'Projeto de teste',
        descricao: 'Descrição do projeto',
        disciplina: 'Engenharia de Software',
        criadoEm: '2026-10-01',
      },
    ];

    let resposta: Projeto[] | undefined;

    service.getTodosProjetos().subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(PROJETOS_API_URL);

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(projetos);

    expect(resposta).toEqual(projetos);
  });

  it('busca um projeto pelo ID com uma requisição GET', () => {
    const projeto: Projeto = {
      id: '1',
      nome: 'Projeto de teste',
      descricao: 'Descrição do projeto',
      disciplina: 'Engenharia de Software',
      criadoEm: '2026-10-01',
    };

    let resposta: Projeto | undefined;

    service.getProjetoPorId('1').subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(
      `${PROJETOS_API_URL}/1`
    );

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(projeto);

    expect(resposta).toEqual(projeto);
  });

  it('busca um projeto com suas tarefas incorporadas pela API', () => {
    const projeto: ProjetoComTarefas = {
      id: '1',
      nome: 'Projeto de teste',
      descricao: 'Descrição do projeto',
      disciplina: 'Engenharia de Software',
      criadoEm: '2026-10-01',
      tarefas: [
        {
          id: '1',
          projetoId: '1',
          titulo: 'Implementar a tela',
          descricao: 'Criar a interface',
          status: 'a-fazer',
          prioridade: 'alta',
          responsavel: 'Estudante',
          prazo: '2026-10-20',
        },
      ],
    };

    let resposta: ProjetoComTarefas | undefined;

    service.getProjetoComTarefas('1').subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(
      `${PROJETOS_API_URL}/1?_embed=tarefas`
    );

    expect(requisicao.request.method).toBe('GET');

    requisicao.flush(projeto);

    expect(resposta).toEqual(projeto);
  });

  // TESTES DE ESCRITA: ISSUE 16

  it('cria uma tarefa com uma requisição POST', () => {
    const dados: NovaTarefa = {
      projetoId: '1',
      titulo: 'Nova tarefa',
      descricao: 'Descrição da tarefa',
      status: 'a-fazer',
      prioridade: 'alta',
      responsavel: 'Estudante',
      prazo: '2026-10-20',
    };

    const tarefaCriada: Tarefa = {
      id: '10',
      ...dados,
    };

    let resposta: Tarefa | undefined;

    service.criarTarefa(dados).subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(TAREFAS_API_URL);

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual(dados);

    requisicao.flush(tarefaCriada);

    expect(resposta).toEqual(tarefaCriada);
  });

  it('atualiza uma tarefa com uma requisição PATCH', () => {
    const dados: Partial<NovaTarefa> = {
      status: 'em-andamento',
    };

    const tarefaAtualizada: Tarefa = {
      id: '2',
      projetoId: '1',
      titulo: 'Estudar Angular',
      descricao: 'Revisar o conteúdo de Angular',
      status: 'em-andamento',
      prioridade: 'media',
      responsavel: 'Estudante',
      prazo: '2026-10-21',
    };

    let resposta: Tarefa | undefined;

    service.atualizarTarefa('2', dados).subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(
      `${TAREFAS_API_URL}/2`
    );

    expect(requisicao.request.method).toBe('PATCH');
    expect(requisicao.request.body).toEqual(dados);

    requisicao.flush(tarefaAtualizada);

    expect(resposta).toEqual(tarefaAtualizada);
  });

  it('cria um projeto com uma requisição POST', () => {
    const dados: NovoProjeto = {
      nome: 'Novo projeto',
      descricao: 'Descrição do projeto',
      disciplina: 'Engenharia de Software',
      criadoEm: '2026-10-17',
    };

    const projetoCriado: Projeto = {
      id: '10',
      ...dados,
    };

    let resposta: Projeto | undefined;

    service.criarProjeto(dados).subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(PROJETOS_API_URL);

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual(dados);

    requisicao.flush(projetoCriado);

    expect(resposta).toEqual(projetoCriado);
  });

  it('atualiza um projeto com uma requisição PATCH', () => {
    const dados: Partial<NovoProjeto> = {
      descricao: 'Descrição atualizada',
    };

    const projetoAtualizado: Projeto = {
      id: '1',
      nome: 'Projeto de teste',
      descricao: 'Descrição atualizada',
      disciplina: 'Engenharia de Software',
      criadoEm: '2026-10-01',
    };

    let resposta: Projeto | undefined;

    service.atualizarProjeto('1', dados).subscribe((resultado) => {
      resposta = resultado;
    });

    const requisicao = httpTesting.expectOne(
      `${PROJETOS_API_URL}/1`
    );

    expect(requisicao.request.method).toBe('PATCH');
    expect(requisicao.request.body).toEqual(dados);

    requisicao.flush(projetoAtualizado);

    expect(resposta).toEqual(projetoAtualizado);
  });
});
