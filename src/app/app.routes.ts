import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DisplayComponent } from './display/display.component';
import { VisorComponent } from './visor/visor.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
  { path: '', redirectTo: 'test', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'display', component: DisplayComponent },
  { path: 'visor', component: VisorComponent },
  { path: '**', redirectTo: 'test' }
];
