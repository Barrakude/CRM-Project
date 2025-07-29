import { TestBed } from '@angular/core/testing';

import { CrmUserService } from './crm-user.service';

describe('CrmUserService', () => {
  let service: CrmUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
