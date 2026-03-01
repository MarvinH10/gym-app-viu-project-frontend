import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ZardButtonComponent, ZardIconComponent, ZardCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
