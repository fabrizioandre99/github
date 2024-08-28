import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoGeiComponent } from './resultado-gei.component';

describe('ResultadoGeiComponent', () => {
  let component: ResultadoGeiComponent;
  let fixture: ComponentFixture<ResultadoGeiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoGeiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResultadoGeiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
