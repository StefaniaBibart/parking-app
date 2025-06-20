import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoaderService } from './shared/services/loader.service';
import { AuthService } from './shared/services/auth.service';
import { AdminService } from './shared/services/admin.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MaterialModule,
        CommonModule,
        SidebarComponent,
        HomeComponent,
        LoaderComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'parking-app';
  isLoggedIn = false;
  hasNavigatedFromRoot = false;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.setupRouterEvents();
  }

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  setupRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loaderService.hide();
        }, 500);
      }
    });
  }
}
