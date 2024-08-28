import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesReconocimientoComponent } from './solicitudes-reconocimiento.component';

describe('SolicitudesReconocimientoComponent', () => {
  let component: SolicitudesReconocimientoComponent;
  let fixture: ComponentFixture<SolicitudesReconocimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesReconocimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitudesReconocimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
