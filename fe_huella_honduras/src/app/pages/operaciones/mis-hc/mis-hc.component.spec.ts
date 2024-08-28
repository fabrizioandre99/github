import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcOrganizacionalComponent } from './mis-hc.component';

describe('HcOrganizacionalComponent', () => {
  let component: HcOrganizacionalComponent;
  let fixture: ComponentFixture<HcOrganizacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HcOrganizacionalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HcOrganizacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
