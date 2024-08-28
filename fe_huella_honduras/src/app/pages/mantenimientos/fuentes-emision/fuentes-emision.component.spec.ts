import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuentesEmisionComponent } from './fuentes-emision.component';

describe('FuentesEmisionComponent', () => {
  let component: FuentesEmisionComponent;
  let fixture: ComponentFixture<FuentesEmisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuentesEmisionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FuentesEmisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
