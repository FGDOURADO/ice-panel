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

  // BroadcastChannel para receber atualizações
  private broadcastChannel: BroadcastChannel | null = null;
  
  // Versões dos dados para controle de atualização
  private lastFlavorVersion: number = 0;
  private lastImagesVersion: number = 0;

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

  // Inicializar BroadcastChannel
  ngOnInit(): void {
    this.setupBroadcastListener();
    this.initializeDataVersions();
  }

  // Inicializar versões dos dados
  private initializeDataVersions(): void {
    this.lastFlavorVersion = this.flavorService.getDataVersion();
    this.lastImagesVersion = this.staticImagesService.getDataVersion();
    console.log('📺 Visor inicializado com versões:', {
      flavor: this.lastFlavorVersion,
      images: this.lastImagesVersion
    });
  }

  // Limpar BroadcastChannel
  ngOnDestroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  // Configurar listener para atualizações
  private setupBroadcastListener(): void {
    this.broadcastChannel = new BroadcastChannel('ice-panel-updates');
    
    this.broadcastChannel.addEventListener('message', (event) => {
      if (event.data.type === 'data-saved') {
        console.log('📺 Visor recebeu notificação de atualização:', event.data.timestamp);
        
        // Verificar se realmente houve mudanças nas versões
        const currentFlavorVersion = this.flavorService.getDataVersion();
        const currentImagesVersion = this.staticImagesService.getDataVersion();
        
        const hasChanges = currentFlavorVersion > this.lastFlavorVersion || 
                          currentImagesVersion > this.lastImagesVersion;
        
        if (hasChanges) {
          console.log('📺 Mudanças detectadas! Atualizando visor...', {
            flavor: `${this.lastFlavorVersion} → ${currentFlavorVersion}`,
            images: `${this.lastImagesVersion} → ${currentImagesVersion}`
          });
          
          // Atualizar versões locais
          this.lastFlavorVersion = currentFlavorVersion;
          this.lastImagesVersion = currentImagesVersion;
          
          // Recarregar a página para mostrar as mudanças
          setTimeout(() => {
            console.log('📺 Recarregando visor na rota atual:', window.location.pathname);
            
            // Verificar se estamos na rota do visor
            if (window.location.pathname.includes('/visor')) {
              console.log('📺 Mantendo rota do visor, recarregando...');
              window.location.reload();
            } else {
              console.log('📺 Redirecionando para visor...');
              window.location.href = '/ice-panel/visor';
            }
          }, 500);
        } else {
          console.log('📺 Nenhuma mudança detectada. Visor não será atualizado.');
        }
      }
    });
  }

}


