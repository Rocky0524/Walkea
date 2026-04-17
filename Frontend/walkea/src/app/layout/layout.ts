import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  isMobile = false;
  sidebarOpen = false;

  ngOnInit(): void {
    this.actualizarModoPantalla();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.actualizarModoPantalla();
  }

  private actualizarModoPantalla(): void {
    this.isMobile = window.innerWidth <= 960;
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}
