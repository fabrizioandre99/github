import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitacoraIncidenciasComponent } from './bitacora-incidencias.component';

describe('BitacoraIncidenciasComponent', () => {
  let component: BitacoraIncidenciasComponent;
  let fixture: ComponentFixture<BitacoraIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BitacoraIncidenciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BitacoraIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
