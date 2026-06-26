import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ogloszenie } from './ogloszenie';

describe('Ogloszenie', () => {
  let component: Ogloszenie;
  let fixture: ComponentFixture<Ogloszenie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ogloszenie],
    }).compileComponents();

    fixture = TestBed.createComponent(Ogloszenie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
