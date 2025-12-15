import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /cart
   * Busca o carrinho do usuário autenticado
   */
  @Get()
  async getCart(@Request() req) {
    const cart = await this.cartService.getCart(req.user.id);
    const totals = this.cartService.calculateTotal(cart);

    return {
      ...cart,
      ...totals,
    };
  }

  /**
   * POST /cart
   * Adiciona um produto ao carrinho
   */
  @Post()
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const cart = await this.cartService.addToCart(req.user.id, dto);
    const totals = this.cartService.calculateTotal(cart);

    return {
      ...cart,
      ...totals,
    };
  }

  /**
   * PATCH /cart/items/:itemId
   * Atualiza a quantidade de um item
   */
  @Patch('items/:itemId')
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(
      req.user.id,
      parseInt(itemId),
      dto,
    );
    const totals = this.cartService.calculateTotal(cart);

    return {
      ...cart,
      ...totals,
    };
  }

  /**
   * DELETE /cart/items/:itemId
   * Remove um item do carrinho
   */
  @Delete('items/:itemId')
  async removeCartItem(@Request() req, @Param('itemId') itemId: string) {
    const cart = await this.cartService.removeCartItem(
      req.user.id,
      parseInt(itemId),
    );
    const totals = this.cartService.calculateTotal(cart);

    return {
      ...cart,
      ...totals,
    };
  }

  /**
   * DELETE /cart
   * Limpa todo o carrinho
   */
  @Delete()
  async clearCart(@Request() req) {
    await this.cartService.clearCart(req.user.id);
    return { message: 'Carrinho limpo com sucesso' };
  }
}
