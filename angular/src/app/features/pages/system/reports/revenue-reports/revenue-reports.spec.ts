import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevenueReports } from './revenue-reports';

describe('RevenueReports', () => {
  let component: RevenueReports;
  let fixture: ComponentFixture<RevenueReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueReports],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
