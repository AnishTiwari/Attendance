import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageleaveComponent } from './manageleave.component';

describe('ManageleaveComponent', () => {
  let component: ManageleaveComponent;
  let fixture: ComponentFixture<ManageleaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageleaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
