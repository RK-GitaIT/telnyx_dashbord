import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicformComponent } from './basicform.component';

describe('BasicformComponent', () => {
  let component: BasicformComponent;
  let fixture: ComponentFixture<BasicformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
