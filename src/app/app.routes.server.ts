import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'projetos/:id/editar', renderMode: RenderMode.Client },
  { path: 'tarefas/nova', renderMode: RenderMode.Client },
  { path: 'tarefas/:id/editar', renderMode: RenderMode.Client },
  { path: 'projetos/:id', renderMode: RenderMode.Client },
  { path: 'tarefas/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];