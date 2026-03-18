import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleTicket } from './detalle-ticket';

describe('DetalleTicket', () => {
  let component: DetalleTicket;
  let fixture: ComponentFixture<DetalleTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleTicket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
