import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkTheme = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.setTheme(prefersDark);
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme());
  }

  private setTheme(isDark: boolean): void {
    this.isDarkTheme.set(isDark);

    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    );

    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
