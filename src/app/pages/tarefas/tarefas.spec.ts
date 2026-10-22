import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { TarefasService } from '../../services/tarefas.service';
import { Tarefas } from './tarefas';

describe('Tarefas', () => {
  it('mostra a lista vazia sem mensagem de erro quando a API falha', async () => {
    await TestBed.configureTestingModule({
      imports: [Tarefas],
      providers: [
        provideRouter([]),
        {
          provide: TarefasService,
          useValue: {
            getTodas: () => throwError(() => new Error('API indisponível')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Tarefas);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tela = fixture.nativeElement as HTMLElement;
    expect(tela.textContent).toContain('Nenhuma tarefa para exibir.');
    expect(tela.querySelector('[role="alert"]')).toBeNull();
    expect(tela.querySelector('button')).toBeNull();

    fixture.destroy();
  });
});
