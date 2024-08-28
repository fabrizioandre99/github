import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccionesMitigacionComponent } from './acciones-mitigacion.component';

describe('AccionesMitigacionComponent', () => {
  let component: AccionesMitigacionComponent;
  let fixture: ComponentFixture<AccionesMitigacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesMitigacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccionesMitigacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
