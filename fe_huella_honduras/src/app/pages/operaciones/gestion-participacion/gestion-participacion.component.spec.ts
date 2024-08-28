import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesParticipacionComponent } from './gestion-participacion.component';

describe('SolicitudesParticipacionComponent', () => {
  let component: SolicitudesParticipacionComponent;
  let fixture: ComponentFixture<SolicitudesParticipacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesParticipacionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SolicitudesParticipacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
