import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaDocumentosComponent } from './bandeja-documentos.component';

describe('BandejaDocumentosComponent', () => {
  let component: BandejaDocumentosComponent;
  let fixture: ComponentFixture<BandejaDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandejaDocumentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BandejaDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
