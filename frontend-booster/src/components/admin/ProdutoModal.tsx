import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Produto, Categoria, Fabricante } from "@/types/produto.types";

interface ProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto | null;
  categorias: Categoria[];
  fabricantes: Fabricante[];
  onSave: (data: any) => Promise<void>;
}

export function ProdutoModal({
  open,
  onOpenChange,
  produto,
  categorias,
  fabricantes,
  onSave,
}: ProdutoModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco_unitario: "",
    id_categoria: "",
    id_fabricante: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || "",
        preco_unitario: produto.preco_unitario.toString(),
        id_categoria: produto.id_categoria.toString(),
        id_fabricante: produto.id_fabricante.toString(),
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        preco_unitario: "",
        id_categoria: "",
        id_fabricante: "",
      });
    }
  }, [produto, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        nome: formData.nome,
        descricao: formData.descricao,
        preco_unitario: parseFloat(formData.preco_unitario),
        id_categoria: parseInt(formData.id_categoria),
        id_fabricante: parseInt(formData.id_fabricante),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {produto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Filtro de Óleo"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descrição detalhada do produto"
              rows={3}
            />
          </div>

          {/* Preço */}
          <div>
            <Label htmlFor="preco">Preço Unitário (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco_unitario}
              onChange={(e) =>
                setFormData({ ...formData, preco_unitario: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <select
              id="categoria"
              value={formData.id_categoria}
              onChange={(e) =>
                setFormData({ ...formData, id_categoria: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Fabricante */}
          <div>
            <Label htmlFor="fabricante">Fabricante *</Label>
            <select
              id="fabricante"
              value={formData.id_fabricante}
              onChange={(e) =>
                setFormData({ ...formData, id_fabricante: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um fabricante</option>
              {fabricantes.map((fab) => (
                <option key={fab.id_fabricante} value={fab.id_fabricante}>
                  {fab.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : produto
                  ? "Atualizar"
                  : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
