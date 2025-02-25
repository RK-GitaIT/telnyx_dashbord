import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpaFormComponent } from './mpa-form.component';

describe('MpaFormComponent', () => {
  let component: MpaFormComponent;
  let fixture: ComponentFixture<MpaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
