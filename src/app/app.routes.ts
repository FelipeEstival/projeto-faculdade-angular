import { Routes } from '@angular/router';
 
export const routes: Routes = [
  {
    path: '', pathMatch: 'full', title: 'Tarefas',
    loadComponent: () => import('./pages/tarefas/tarefas').then((m) => m.Tarefas),
  },
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
    path: 'projetos/:id',
    title: 'Detalhe do projeto',
    loadComponent: () => import('./pages/detalhe-projeto/detalhe-projeto').then((m) => m.DetalheProjeto),
  },
  {
    path: 'projetos',
    title: 'Projetos',
    loadComponent: () => import('./pages/projetos/projetos').then((m) => m.Projetos),
  },
  {
    path: '**', title: 'Página não encontrada',
    loadComponent: () => import('./pages/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
 