import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
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

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

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
      const primeiroInvalido = Object.entries(formulario.controls).find(
        ([, controle]) =>
          controle.invalid || (typeof controle.value === 'string' && !controle.value.trim()),
      )?.[0];
      if (primeiroInvalido)
        this.elemento.nativeElement
          .querySelector<HTMLElement>(`[name="${primeiroInvalido}"]`)
          ?.focus();
      return;
    }

    this.salvar.emit(dados);
  }

  private dadosVazios(): DadosProjeto {
    return { nome: '', descricao: '', disciplina: '' };
  }
}
