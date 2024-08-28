import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresDesempenoComponent } from './indicadores-desempeno.component';

describe('IndicadoresDesempenoComponent', () => {
  let component: IndicadoresDesempenoComponent;
  let fixture: ComponentFixture<IndicadoresDesempenoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadoresDesempenoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndicadoresDesempenoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
