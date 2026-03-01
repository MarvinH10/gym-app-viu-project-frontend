import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    // Cargar preferencia guardada o usar la de sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Si el usuario pidió explícitamente oscuro por defecto en index.html antes,
    // pero ahora quiere claro por defecto, respetamos la inicialización en false.
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    } else if (savedTheme === 'light') {
      this.isDarkMode.set(false);
    } else {
      // Por defecto ahora es claro (false)
      this.isDarkMode.set(false);
    }

    // Efecto para aplicar la clase al documento
    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggle() {
    this.isDarkMode.update((dark) => !dark);
  }
}
