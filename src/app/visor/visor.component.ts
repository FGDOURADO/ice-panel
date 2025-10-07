import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlavorService, Flavor, Title, Image } from '../services/flavor.service';
import { StaticImagesService, StaticImage } from '../services/static-images.service';

@Component({
  selector: 'app-visor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.css']
})
export class VisorComponent {
  private readonly flavorService = inject(FlavorService);
  private readonly staticImagesService = inject(StaticImagesService);

  readonly grid = this.flavorService.grid;
  readonly flavors = this.flavorService.flavors;
  readonly categories = this.flavorService.categories;
  readonly titles = this.flavorService.titles;
  readonly images = this.staticImagesService.images;
  readonly settings = this.flavorService.settings;
  readonly headerGrid = this.flavorService.headerGrid;

  // Menu auto-hide state
  readonly showMenu = signal(false);
  readonly enableScroll = signal(false);
  private hideMenuTimeout: any;
  private hideScrollTimeout: any;

  // TV Mode detection
  isTVMode(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tv') === 'true' || urlParams.get('mode') === 'tv';
  }

  // Toggle fullscreen for casting
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  readonly placedFlavors = computed<Flavor[]>(() => {
    const ids = this.grid().cells.filter((id): id is string => !!id);
    const list = ids
      .map((id) => this.flavors().find((f) => f.id === id))
      .filter((f): f is Flavor => !!f);
    return list;
  });

  nameFor(id: string | null): string {
    if (!id) return '';
    return this.flavors().find(f => f.id === id)?.name ?? '';
  }

  categoryName(id: string | null): string {
    if (!id) return '';
    return this.categories().find(c => c.id === id)?.name ?? '';
  }

  titleName(id: string | null): string {
    if (!id) return '';
    return this.titles().find(t => t.id === id)?.name ?? '';
  }

  imageName(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find((i: StaticImage) => i.id === imageId)?.name ?? '';
  }

  imageUrl(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find((i: StaticImage) => i.id === imageId)?.url ?? '';
  }

  // Show menu and scroll on mouse move
  @HostListener('mousemove')
  onMouseMove(): void {
    this.showMenu.set(true);
    this.enableScroll.set(true);
    this.resetHideTimeout();
    this.resetScrollTimeout();
  }

  // Hide menu after 3 seconds
  private resetHideTimeout(): void {
    if (this.hideMenuTimeout) {
      clearTimeout(this.hideMenuTimeout);
    }
    this.hideMenuTimeout = setTimeout(() => {
      this.showMenu.set(false);
    }, 3000);
  }

  // Hide scroll after 3 seconds
  private resetScrollTimeout(): void {
    if (this.hideScrollTimeout) {
      clearTimeout(this.hideScrollTimeout);
    }
    this.hideScrollTimeout = setTimeout(() => {
      this.enableScroll.set(false);
    }, 3000);
  }

  // Show menu and scroll on mouse enter
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showMenu.set(true);
    this.enableScroll.set(true);
    this.resetHideTimeout();
    this.resetScrollTimeout();
  }


}


