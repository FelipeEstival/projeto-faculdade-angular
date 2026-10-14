import { Routes } from '@angular/router';
 
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tarefas' },
  {
    path: 'tarefas/:id',
    title: 'Detalhe da tarefa',
    loadComponent: () => import('./pages/detalhe-tarefa/detalhe-tarefa').then((m) => m.DetalheTarefa),
  },
  {
    path: 'tarefas',
    title: 'Tarefas',
    loadComponent: () => import('./pages/tarefas/tarefas').then((m) => m.Tarefas),
  },
  {
    path: 'projetos',
    title: 'Projetos',
    loadComponent: () => import('./pages/projetos/projetos').then((m) => m.Projetos),
  },
];
 