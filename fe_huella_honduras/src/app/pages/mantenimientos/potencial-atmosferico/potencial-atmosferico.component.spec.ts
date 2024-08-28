import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotencialAtmosfericoComponent } from './potencial-atmosferico.component';

describe('PotencialAtmosfericoComponent', () => {
  let component: PotencialAtmosfericoComponent;
  let fixture: ComponentFixture<PotencialAtmosfericoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PotencialAtmosfericoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PotencialAtmosfericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
