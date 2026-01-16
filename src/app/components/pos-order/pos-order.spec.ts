import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrder } from './pos-order';

describe('PosOrder', () => {
  let component: PosOrder;
  let fixture: ComponentFixture<PosOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
