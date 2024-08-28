import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedidasMitigacionComponent } from './medidas-mitigacion.component';

describe('MedidasMitigacionComponent', () => {
  let component: MedidasMitigacionComponent;
  let fixture: ComponentFixture<MedidasMitigacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedidasMitigacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedidasMitigacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
