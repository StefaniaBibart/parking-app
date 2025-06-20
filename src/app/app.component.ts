import { Component, computed } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { MaterialModule } from './material.module';

import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoaderService } from './shared/services/loader.service';
import { AuthService } from './shared/services/auth.service';
import { AdminService } from './shared/services/admin.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MaterialModule, SidebarComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'parking-app';
  hasNavigatedFromRoot = false;

  isLoggedIn = computed(() => !!this.authService.user());

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.setupRouterEvents();
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
