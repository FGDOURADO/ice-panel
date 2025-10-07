import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: #f0f0f0; min-height: 100vh;">
      <h1>🎉 Ice Panel - Funcionando!</h1>
      <p>Se você está vendo isso, o roteamento está funcionando perfeitamente!</p>
      <p>URL atual: <strong>https://fgdourado.github.io/ice-panel/</strong></p>
      
      <div style="margin-top: 30px;">
        <h2>Navegação:</h2>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <a href="/ice-panel/display" style="padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Display</a>
          <a href="/ice-panel/admin" style="padding: 10px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">Admin</a>
          <a href="/ice-panel/visor" style="padding: 10px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Visor</a>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 5px;">
        <h3>✅ Status do Deploy:</h3>
        <ul>
          <li>✅ GitHub Pages funcionando</li>
          <li>✅ Angular carregando</li>
          <li>✅ Roteamento ativo</li>
          <li>✅ Componentes carregando</li>
        </ul>
      </div>
    </div>
  `
})
export class TestComponent {}
