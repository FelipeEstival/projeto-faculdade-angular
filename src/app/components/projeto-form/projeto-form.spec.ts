import { TestBed } from '@angular/core/testing';
import type { DadosProjeto, Projeto } from '../../../tipos';
import { ProjetoForm } from './projeto-form';

describe('ProjetoForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjetoForm] }).compileComponents();
  });

  it('preenche o formulário ao editar um projeto existente', async () => {
    const fixture = TestBed.createComponent(ProjetoForm);
    fixture.componentRef.setInput('projeto', {
      id: '1',
      nome: 'Gerenciador de Tarefas',
      descricao: 'Organização da equipe',
      disciplina: 'Desenvolvimento Frontend',
      criadoEm: '2026-10-01',
    } satisfies Projeto);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tela = fixture.nativeElement as HTMLElement;
    expect((tela.querySelector('[name="nome"]') as HTMLInputElement).value).toBe(
      'Gerenciador de Tarefas',
    );
    expect((tela.querySelector('[name="descricao"]') as HTMLTextAreaElement).value).toBe(
      'Organização da equipe',
    );
    expect((tela.querySelector('[name="disciplina"]') as HTMLInputElement).value).toBe(
      'Desenvolvimento Frontend',
    );
  });

  it('exibe validação e não emite dados quando os campos obrigatórios estão vazios', async () => {
    const fixture = TestBed.createComponent(ProjetoForm);
    const enviados: DadosProjeto[] = [];
    fixture.componentInstance.salvar.subscribe((dados) => enviados.push(dados));
    fixture.detectChanges();
    await fixture.whenStable();

    const formulario = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(enviados).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Informe o nome do projeto');
    expect(fixture.nativeElement.textContent).toContain('Informe a descrição do projeto');
    expect(fixture.nativeElement.textContent).toContain('Informe a disciplina');
  });

  it('remove espaços externos e emite os dados válidos', async () => {
    const fixture = TestBed.createComponent(ProjetoForm);
    const enviados: DadosProjeto[] = [];
    fixture.componentInstance.salvar.subscribe((dados) => enviados.push(dados));
    fixture.detectChanges();
    await fixture.whenStable();

    const tela = fixture.nativeElement as HTMLElement;
    const campos: [HTMLInputElement | HTMLTextAreaElement, string][] = [
      [tela.querySelector('[name="nome"]') as HTMLInputElement, '  Projeto da equipe  '],
      [tela.querySelector('[name="descricao"]') as HTMLTextAreaElement, '  Descrição do projeto  '],
      [tela.querySelector('[name="disciplina"]') as HTMLInputElement, '  Engenharia de Software  '],
    ];

    for (const [campo, valor] of campos) {
      campo.value = valor;
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const formulario = tela.querySelector('form') as HTMLFormElement;
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(enviados).toEqual([
      {
        nome: 'Projeto da equipe',
        descricao: 'Descrição do projeto',
        disciplina: 'Engenharia de Software',
      },
    ]);
  });
});
