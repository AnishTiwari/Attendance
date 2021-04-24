import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessordigisignComponent } from './professordigisign.component';

describe('ProfessordigisignComponent', () => {
  let component: ProfessordigisignComponent;
  let fixture: ComponentFixture<ProfessordigisignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfessordigisignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessordigisignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
