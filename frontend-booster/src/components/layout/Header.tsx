import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Search,
  ShoppingCart,
  Menu,
  LogIn,
  User,
  LogOut,
  Package,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";
import { LoginModal } from "../auth/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">
                AI<span className="text-blue-600">Car</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="text-slate-600 hover:text-blue-600"
              >
                Início
              </button>

              <button
                onClick={() => navigate("/pecas")}
                className="text-slate-600 hover:text-blue-600"
              >
                Peças
              </button>

              <button
                onClick={() => navigate("/servicos")}
                className="text-slate-600 hover:text-blue-600"
              >
                Serviços
              </button>

              <a href="/contato" className="text-slate-600 hover:text-blue-600">
                Contato
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </Button>

              {/* Botão Painel Admin (visível para admins) */}
              {isAuthenticated && user?.role === "ADMIN" && (
                <Button
                  variant="outline"
                  className="hidden lg:flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}

              {/* Mostrar botão de login OU menu do usuário */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="max-w-[150px] truncate">
                        {user.nome}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.nome}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {user.role === "ADMIN" ? "Administrador" : "Cliente"}
                      </p>
                    </div>

                    {/* <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem> */}

                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      <Package className="h-4 w-4 mr-2" />
                      Meus Pedidos
                    </DropdownMenuItem>

                    {user.role === "ADMIN" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="text-purple-600 font-medium focus:text-purple-700 focus:bg-purple-50"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Painel Admin
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="hidden md:flex items-center gap-2"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
}
