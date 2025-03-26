import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotSelectionComponent } from './spot-selection.component';

describe('SpotSelectionComponent', () => {
  let component: SpotSelectionComponent;
  let fixture: ComponentFixture<SpotSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
