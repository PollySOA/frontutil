import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PallasPreview } from './pallas-preview';

describe('PallasPreview', () => {
  let component: PallasPreview;
  let fixture: ComponentFixture<PallasPreview>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PallasPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PallasPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
