import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ice-panel');

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check for redirect from 404.html
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      console.log('App: Restoring path:', redirect);
      sessionStorage.removeItem('redirect');
      
      // Navigate to the restored path
      this.router.navigateByUrl(redirect.replace('/ice-panel', ''));
    }
  }
}
