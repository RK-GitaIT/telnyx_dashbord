import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalformComponent } from './medicalform.component';

describe('MedicalformComponent', () => {
  let component: MedicalformComponent;
  let fixture: ComponentFixture<MedicalformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
