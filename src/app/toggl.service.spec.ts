import { TestBed } from '@angular/core/testing';

import { TogglService } from './toggl.service';

describe('TogglService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TogglService = TestBed.get(TogglService);
    expect(service).toBeTruthy();
  });
});
