import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Produto } from '../catalog/produto/entities/produto.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  /**
   * Busca ou cria o carrinho do usuário
   */
  async findOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { id_usuario: userId },
      relations: ['items', 'items.produto'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        id_usuario: userId,
        items: [],
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Busca o carrinho do usuário
   */
  async getCart(userId: number): Promise<Cart> {
    return this.findOrCreateCart(userId);
  }

  /**
   * Adiciona um produto ao carrinho
   */
  async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
    // Verifica se o produto existe
    const produto = await this.produtoRepository.findOne({
      where: { id_produto: dto.id_produto },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Busca ou cria o carrinho
    const cart = await this.findOrCreateCart(userId);

    // Verifica se o produto já está no carrinho
    const existingItem = cart.items.find(
      (item) => item.id_produto === dto.id_produto,
    );

    if (existingItem) {
      // Atualiza a quantidade
      existingItem.quantidade += dto.quantidade;
      existingItem.updated_at = new Date();
      await this.cartItemRepository.save(existingItem);
    } else {
      // Cria novo item
      const newItem = this.cartItemRepository.create({
        id_carrinho: cart.id_carrinho,
        id_produto: dto.id_produto,
        quantidade: dto.quantidade,
        preco_unitario: produto.preco_unitario,
      });
      await this.cartItemRepository.save(newItem);
    }

    // Retorna o carrinho atualizado
    return this.getCart(userId);
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   */
  async updateCartItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);

    const item = cart.items.find(
      (item) => item.id_carrinho_item === itemId,
    );

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    item.quantidade = dto.quantidade;
    item.updated_at = new Date();
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  /**
   * Remove um item do carrinho
   */
  async removeCartItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);

    const item = cart.items.find(
      (item) => item.id_carrinho_item === itemId,
    );

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.cartItemRepository.remove(item);

    return this.getCart(userId);
  }

  /**
   * Limpa todo o carrinho
   */
  async clearCart(userId: number): Promise<void> {
    const cart = await this.findOrCreateCart(userId);

    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }

  /**
   * Calcula o total do carrinho
   */
  calculateTotal(cart: Cart): { totalItems: number; totalPrice: number } {
    const totalItems = cart.items.reduce(
      (sum, item) => sum + item.quantidade,
      0,
    );
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.preco_unitario) * item.quantidade,
      0,
    );

    return { totalItems, totalPrice };
  }
}
