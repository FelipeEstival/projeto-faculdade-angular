import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import type { NovaTarefa, Prioridade, Projeto, Status, Tarefa } from '../../../tipos';
import { TarefasService } from '../../services/tarefas.service';

@Component({
  selector: 'app-tarefa-form',
  imports: [FormsModule],
  templateUrl: './tarefa-form.html',
  styleUrl: './tarefa-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaForm implements OnInit, OnChanges {
  @Input() tarefa: Tarefa | null = null;
  @Input() enviando = false;
  @Input() projetoIdInicial = '';
  private readonly cdr = inject(ChangeDetectorRef);
  @Output() salvar = new EventEmitter<NovaTarefa>();
  @Output() cancelar = new EventEmitter<void>();

  private readonly tarefasService = inject(TarefasService);

  protected projetos: Projeto[] = [];
  protected carregandoProjetos = true;
  protected erroProjetos = '';

  protected readonly statusOpcoes: { valor: Status; texto: string }[] = [
    { valor: 'a-fazer', texto: 'A fazer' },
    { valor: 'em-andamento', texto: 'Em andamento' },
    { valor: 'em-revisao', texto: 'Em revisão' },
    { valor: 'concluida', texto: 'Concluída' },
  ];

  protected readonly prioridadeOpcoes: { valor: Prioridade; texto: string }[] = [
    { valor: 'baixa', texto: 'Baixa' },
    { valor: 'media', texto: 'Média' },
    { valor: 'alta', texto: 'Alta' },
  ];

  protected dados: NovaTarefa = this.novaTarefaVazia();

  ngOnInit(): void {
    this.carregarProjetos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tarefa'] || changes['projetoIdInicial']) {
      this.dados = this.tarefa
        ? {
            projetoId: this.tarefa.projetoId,
            titulo: this.tarefa.titulo,
            descricao: this.tarefa.descricao,
            status: this.tarefa.status,
            prioridade: this.tarefa.prioridade,
            responsavel: this.tarefa.responsavel,
            prazo: this.tarefa.prazo,
          }
        : this.novaTarefaVazia();
    }
  }

  protected enviar(formulario: NgForm): void {
    if (this.enviando || this.carregandoProjetos || this.erroProjetos) {
      return;
    }

    if (formulario.invalid || !this.dados.projetoId) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.salvar.emit({ ...this.dados });
  }

  private carregarProjetos(): void {
    this.carregandoProjetos = true;
    this.erroProjetos = '';

    this.tarefasService.getTodosProjetos().subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.carregandoProjetos = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erroProjetos = 'Não foi possível carregar os projetos. Verifique se a API está funcionando.';
        this.carregandoProjetos = false;
        this.cdr.markForCheck();
      },
    });
  }

  private novaTarefaVazia(): NovaTarefa {
    return {
      projetoId: this.projetoIdInicial,
      titulo: '',
      descricao: '',
      status: 'a-fazer',
      prioridade: 'media',
      responsavel: '',
      prazo: '',
    };
  }
}
