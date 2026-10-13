import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MainLayout } from './components/main-layout';
 
@Component({
  selector: 'app-root',
  imports: [MainLayout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}