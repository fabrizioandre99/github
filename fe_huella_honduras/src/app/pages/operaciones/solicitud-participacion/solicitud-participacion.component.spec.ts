import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudParticipacionComponent } from './solicitud-participacion.component';

describe('SolicitudParticipacionComponent', () => {
  let component: SolicitudParticipacionComponent;
  let fixture: ComponentFixture<SolicitudParticipacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudParticipacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitudParticipacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
