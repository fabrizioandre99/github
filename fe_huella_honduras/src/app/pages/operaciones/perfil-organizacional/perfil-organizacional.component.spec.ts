import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilOrganizacionalComponent } from './perfil-organizacional.component';

describe('PerfilOrganizacionalComponent', () => {
  let component: PerfilOrganizacionalComponent;
  let fixture: ComponentFixture<PerfilOrganizacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilOrganizacionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfilOrganizacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
