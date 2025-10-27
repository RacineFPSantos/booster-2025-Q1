import { Test, TestingModule } from '@nestjs/testing';
import { FabricanteService } from './fabricante.service';

describe('FabricanteService', () => {
  let service: FabricanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FabricanteService],
    }).compile();

    service = module.get<FabricanteService>(FabricanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
