import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitesInformeComponent } from './limites-informe.component';

describe('LimitesInformeComponent', () => {
  let component: LimitesInformeComponent;
  let fixture: ComponentFixture<LimitesInformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitesInformeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LimitesInformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
