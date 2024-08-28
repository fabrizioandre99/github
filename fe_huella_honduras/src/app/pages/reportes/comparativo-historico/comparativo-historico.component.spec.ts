import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativoHistoricoComponent } from './comparativo-historico.component';

describe('ComparativoHistoricoComponent', () => {
  let component: ComparativoHistoricoComponent;
  let fixture: ComponentFixture<ComparativoHistoricoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativoHistoricoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComparativoHistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
