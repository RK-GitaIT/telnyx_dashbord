import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRTCCallComponent } from './web-rtccall.component';

describe('WebRTCCallComponent', () => {
  let component: WebRTCCallComponent;
  let fixture: ComponentFixture<WebRTCCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebRTCCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebRTCCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
