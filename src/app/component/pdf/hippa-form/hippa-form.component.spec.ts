import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HippaFormComponent } from './hippa-form.component';

describe('HippaFormComponent', () => {
  let component: HippaFormComponent;
  let fixture: ComponentFixture<HippaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HippaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HippaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
