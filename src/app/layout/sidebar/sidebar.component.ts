import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  isDarkTheme = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
