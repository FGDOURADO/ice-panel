import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { DisplayComponent } from './display/display.component';
import { VisorComponent } from './visor/visor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'display', component: DisplayComponent },
  { path: 'visor', component: VisorComponent },
  { path: '**', redirectTo: '' }
];
