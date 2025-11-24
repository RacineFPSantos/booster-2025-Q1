import { type Produto } from "@/types/produto.types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";

interface ProdutoCardProps {
  produto: Produto;
  onAddToCart?: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onAddToCart }: ProdutoCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 flex items-center justify-center h-48">
        <Package className="h-20 w-20 text-slate-300" />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {produto.nome}
        </h3>

        <p className="text-sm text-slate-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {produto.descricao || "Sem descrição"}
        </p>

        <div className="space-y-1 text-sm">
          {produto.categoria && (
            <p className="text-slate-500">
              <span className="font-medium">Categoria:</span>{" "}
              {produto.categoria.nome}
            </p>
          )}
          {produto.fabricante && (
            <p className="text-slate-500">
              <span className="font-medium">Fabricante:</span>{" "}
              {produto.fabricante.nome}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {formatPrice(Number(produto.preco_unitario))}
          </p>
          <p className="text-xs text-slate-500">Preço unitário</p>
        </div>

        {onAddToCart && (
          <Button
            onClick={() => onAddToCart(produto)}
            className="gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
