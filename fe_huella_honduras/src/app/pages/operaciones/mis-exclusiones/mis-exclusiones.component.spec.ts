import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisExclusionesComponent } from './mis-exclusiones.component';

describe('MisExclusionesComponent', () => {
  let component: MisExclusionesComponent;
  let fixture: ComponentFixture<MisExclusionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisExclusionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MisExclusionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
