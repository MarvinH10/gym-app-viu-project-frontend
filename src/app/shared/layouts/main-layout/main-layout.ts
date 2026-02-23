import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@/shared/components/navbar/navbar';
import { Footer } from '@/shared/components/footer/footer';
import { Sidebar } from '@/shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Footer, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
