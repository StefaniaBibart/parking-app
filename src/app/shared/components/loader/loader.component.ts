import { Component, Signal } from '@angular/core';

import { MaterialModule } from '../../../material.module';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  imports: [MaterialModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {
  isLoading: Signal<boolean>;

  constructor(private loaderService: LoaderService) {
    this.isLoading = this.loaderService.isLoading;
  }
}
