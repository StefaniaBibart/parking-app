import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <h2>{{ componentName }} works!</h2>
    </div>
  `,
  styles: [
    `
      .placeholder-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 24px;
        color: var(--text);
      }
    `,
  ],
})
export class PlaceholderComponent implements OnInit {
  componentName: string = 'Component';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const path = this.route.snapshot.routeConfig?.path || '';
    this.componentName = path.charAt(0).toUpperCase() + path.slice(1);
  }
}
