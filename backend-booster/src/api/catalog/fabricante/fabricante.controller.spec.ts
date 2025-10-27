import { Test, TestingModule } from '@nestjs/testing';
import { FabricanteController } from './fabricante.controller';
import { FabricanteService } from './fabricante.service';

describe('FabricanteController', () => {
  let controller: FabricanteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FabricanteController],
      providers: [FabricanteService],
    }).compile();

    controller = module.get<FabricanteController>(FabricanteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
