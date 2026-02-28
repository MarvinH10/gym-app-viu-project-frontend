import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZardToastImports } from '@/shared/components/toast/toast.imports';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ...ZardToastImports],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
