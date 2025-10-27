import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutoDto);
    return await this.produtoRepository.save(produto);
  }

  async findAll(): Promise<Produto[]> {
    return await this.produtoRepository.find({
      relations: ['categoria', 'fabricante'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { id_produto: id },
      relations: ['categoria', 'fabricante'],
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }

  async update(
    id: number,
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    const produto = await this.findOne(id);
    Object.assign(produto, updateProdutoDto);
    produto.updated_at = new Date();
    return await this.produtoRepository.save(produto);
  }

  async remove(id: number): Promise<void> {
    const produto = await this.findOne(id);
    await this.produtoRepository.remove(produto);
  }
}
