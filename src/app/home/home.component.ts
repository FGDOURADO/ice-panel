import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = '🍦 Painel de Gelateria';
  description = 'Sistema de gerenciamento para gelateria';
  
  menuItems = [
    {
      title: 'Admin',
      description: 'Gerenciar sabores, categorias e imagens',
      route: '/admin',
      icon: '⚙️',
      color: '#4a5568'
    },
    {
      title: 'Display',
      description: 'Organizar grid de sabores e títulos',
      route: '/display',
      icon: '🎯',
      color: '#38a169'
    },
    {
      title: 'Visor',
      description: 'Visualização para TV (modo público)',
      route: '/visor',
      icon: '📺',
      color: '#2d3748'
    }
  ];
}
