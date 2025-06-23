import { Component, OnInit } from '@angular/core';

import { MaterialModule } from '../../../material.module';
import { LoaderService } from '../../services/loader.service';

@Component({
    selector: 'app-loader',
    imports: [MaterialModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  isLoading = false;

  constructor(private loaderService: LoaderService) {}

  ngOnInit() {
    this.loaderService.isLoading$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }
}
