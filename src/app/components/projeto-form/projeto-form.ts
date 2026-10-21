import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import type { DadosProjeto, Projeto } from '../../../tipos';

@Component({
  selector: 'app-projeto-form',
  imports: [FormsModule],
  templateUrl: './projeto-form.html',
  styleUrl: './projeto-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjetoForm implements OnChanges {
  @Input() projeto: Projeto | null = null;
  @Input() enviando = false;
  @Output() salvar = new EventEmitter<DadosProjeto>();
  @Output() cancelar = new EventEmitter<void>();

  protected dados: DadosProjeto = this.dadosVazios();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projeto']) {
      this.dados = this.projeto
        ? {
            nome: this.projeto.nome,
            descricao: this.projeto.descricao,
            disciplina: this.projeto.disciplina,
          }
        : this.dadosVazios();
    }
  }

  protected enviar(formulario: NgForm): void {
    if (this.enviando) {
      return;
    }

    const dados = {
      nome: this.dados.nome.trim(),
      descricao: this.dados.descricao.trim(),
      disciplina: this.dados.disciplina.trim(),
    };

    if (formulario.invalid || !dados.nome || !dados.descricao || !dados.disciplina) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.salvar.emit(dados);
  }

  private dadosVazios(): DadosProjeto {
    return { nome: '', descricao: '', disciplina: '' };
  }
}
