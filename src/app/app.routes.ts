import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DisplayComponent } from './display/display.component';
import { VisorComponent } from './visor/visor.component';

export const routes: Routes = [
  { path: '', redirectTo: 'display', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: 'display', component: DisplayComponent },
  { path: 'visor', component: VisorComponent },
  { path: '**', redirectTo: 'display' }
];
