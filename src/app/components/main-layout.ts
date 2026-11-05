import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, map, skip } from 'rxjs';
import { Header } from './header';

@Component({
  selector: 'app-main-layout',
  imports: [Header, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly conteudo = viewChild<ElementRef<HTMLElement>>('conteudo');
  private readonly injector = inject(Injector);

  constructor() {
    // Trocar de página leva o teclado ao conteúdo. Alterar filtros mantém o foco no campo.
    inject(Router)
      .events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        afterNextRender(() => this.conteudo()?.nativeElement.focus(), { injector: this.injector });
      });
  }
}
