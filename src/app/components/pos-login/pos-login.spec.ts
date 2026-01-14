import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosLogin } from './pos-login';

describe('PosLogin', () => {
  let component: PosLogin;
  let fixture: ComponentFixture<PosLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
