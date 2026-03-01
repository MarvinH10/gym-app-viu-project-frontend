import { inject } from '@angular/core';
import { Component } from '@angular/core';
import { SidebarService } from '@/core/services/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Navbar } from '@/shared/components/navbar/navbar';
import { Sidebar } from '@/shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar, CdkScrollable],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  sidebarService = inject(SidebarService);
}
