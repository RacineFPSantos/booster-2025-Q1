import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { CartService } from "@/services/cartService";
import type { Cart, CartItem, CartContextType } from "@/types/cart.types";
import type { Produto } from "@/types/produto.types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar carrinho quando o usuário faz login
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Limpar carrinho quando fazer logout
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
  }, [isAuthenticated]);

  // Calcular subtotais dos itens (converte CartItemResponse para CartItem)
  const addSubtotals = (items: any[]): CartItem[] => {
    return items.map((item) => ({
      ...item,
      subtotal: Number(item.preco_unitario) * item.quantidade,
    }));
  };

  // Carregar carrinho do backend
  const loadCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const data = await CartService.getCart();
      setCart({
        ...data,
        items: addSubtotals(data.items),
      });
    } catch (error: any) {
      console.error("Erro ao carregar carrinho:", error);
      // Não mostrar toast de erro para não incomodar o usuário
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar produto ao carrinho
  const addProduto = async (produto: Produto, quantidade: number = 1) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para adicionar ao carrinho");
      return;
    }

    try {
      setIsLoading(true);
      const data = await CartService.addToCart({
        id_produto: produto.id_produto,
        quantidade,
      });
      setCart({
        ...data,
        items: addSubtotals(data.items),
      });
      toast.success(`${produto.nome} adicionado ao carrinho!`);
    } catch (error: any) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error(error.message || "Erro ao adicionar ao carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  // Remover item do carrinho
  const removeItem = async (itemId: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const data = await CartService.removeCartItem(itemId);
      setCart({
        ...data,
        items: addSubtotals(data.items),
      });
      toast.info("Item removido do carrinho");
    } catch (error: any) {
      console.error("Erro ao remover item:", error);
      toast.error(error.message || "Erro ao remover item");
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar quantidade de um item
  const updateQuantidade = async (itemId: number, quantidade: number) => {
    if (!isAuthenticated) return;

    if (quantidade <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      setIsLoading(true);
      const data = await CartService.updateCartItem(itemId, { quantidade });
      setCart({
        ...data,
        items: addSubtotals(data.items),
      });
    } catch (error: any) {
      console.error("Erro ao atualizar quantidade:", error);
      toast.error(error.message || "Erro ao atualizar quantidade");
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await CartService.clearCart();
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      toast.info("Carrinho limpo");
    } catch (error: any) {
      console.error("Erro ao limpar carrinho:", error);
      toast.error(error.message || "Erro ao limpar carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  // Obter quantidade de um produto específico no carrinho
  const getItemQuantity = (produtoId: number): number => {
    const item = cart.items.find((item) => item.id_produto === produtoId);
    return item?.quantidade || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addProduto,
        removeItem,
        updateQuantidade,
        clearCart,
        loadCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
