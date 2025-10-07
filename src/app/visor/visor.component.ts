import { Component, computed, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
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
export class VisorComponent implements OnInit, OnDestroy {
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

  // Auto-refresh state
  readonly lastRefresh = signal(new Date());
  private refreshInterval: any;
  private lastGridState: string = '';
  private lastHeaderGridState: string = '';
  private lastImagesState: string = '';
  private lastSettingsState: string = '';

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

  // Auto-refresh lifecycle
  ngOnInit(): void {
    this.initializeStates();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    if (this.hideMenuTimeout) {
      clearTimeout(this.hideMenuTimeout);
    }
    if (this.hideScrollTimeout) {
      clearTimeout(this.hideScrollTimeout);
    }
  }

  // Initialize state tracking
  private initializeStates(): void {
    this.lastGridState = JSON.stringify(this.grid());
    this.lastHeaderGridState = JSON.stringify(this.headerGrid());
    this.lastImagesState = JSON.stringify(this.images());
    this.lastSettingsState = JSON.stringify(this.settings());
  }

  // Start auto-refresh every 1 minute
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 60000); // 1 minute = 60000ms
  }

  // Stop auto-refresh
  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Check for changes and refresh if needed
  private refreshData(): void {
    const currentGridState = JSON.stringify(this.grid());
    const currentHeaderGridState = JSON.stringify(this.headerGrid());
    const currentImagesState = JSON.stringify(this.images());
    const currentSettingsState = JSON.stringify(this.settings());

    // Check if any data has changed
    const hasChanges = 
      currentGridState !== this.lastGridState ||
      currentHeaderGridState !== this.lastHeaderGridState ||
      currentImagesState !== this.lastImagesState ||
      currentSettingsState !== this.lastSettingsState;

    // Always update timestamp for debugging
    this.lastRefresh.set(new Date());

    if (hasChanges) {
      // Update states
      this.lastGridState = currentGridState;
      this.lastHeaderGridState = currentHeaderGridState;
      this.lastImagesState = currentImagesState;
      this.lastSettingsState = currentSettingsState;

      // Force re-render by updating signals
      this.flavorService.forceSave();
      this.staticImagesService.forceSave();
      
      console.log('🔄 Visor atualizado automaticamente:', new Date().toLocaleTimeString());
    } else {
      console.log('⏰ Verificação de mudanças - sem alterações:', new Date().toLocaleTimeString());
    }
  }

  // Manual refresh method
  forceRefresh(): void {
    this.refreshData();
  }
}


