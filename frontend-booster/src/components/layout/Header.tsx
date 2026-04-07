import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  ShoppingCart,
  Menu,
  X,
  LogIn,
  User,
  LogOut,
  Package,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";
import { LoginModal } from "../auth/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "../theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navLinks = [
  { name: "Início", path: "/" },
  { name: "Peças", path: "/pecas" },
  { name: "Serviços", path: "/servicos" },
  { name: "Contato", path: "/contato" },
];

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = () => setIsLoginModalOpen(true);
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-theme-bg/80 backdrop-blur-md border-b border-theme-border py-4"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center">
            {/* Logo */}
            <div
              className="flex items-center gap-1 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-heading font-extrabold text-brand-blue tracking-tighter group-hover:text-blue-400 transition-colors">
                AI
              </span>
              <span className="text-2xl font-heading font-bold text-theme-text-primary tracking-tight transition-colors duration-300">
                Car
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center justify-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNav(link.path)}
                  className="text-sm font-medium text-theme-text-secondary hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center justify-end gap-3">
              <div className="hidden md:flex items-center gap-3">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />

                <button
                  onClick={() => navigate("/cart")}
                  className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors relative"
                  aria-label="Carrinho"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </button>

                <div className="h-6 w-px bg-theme-border mx-1" />

                {isAuthenticated && user?.role === "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}

                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2"
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
                        <p className="text-sm font-medium text-theme-text-primary">
                          {user.nome}
                        </p>
                        <p className="text-xs text-theme-text-muted truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {user.role === "ADMIN" ? "Administrador" : "Cliente"}
                        </p>
                      </div>
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
                    className="flex items-center gap-2"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <button
                  className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-theme-surface border-b border-theme-border overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNav(link.path)}
                    className="text-left text-base font-medium text-theme-text-secondary hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </button>
                ))}

                <div className="h-px w-full bg-theme-border my-2" />

                <button
                  onClick={() => navigate("/cart")}
                  className="flex items-center gap-2 text-base font-medium text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                  {cart.totalItems > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </button>

                <div className="h-px w-full bg-theme-border" />

                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-theme-text-muted">
                      Olá,{" "}
                      <strong className="text-theme-text-primary">
                        {user.nome}
                      </strong>
                    </p>
                    <button
                      onClick={() => handleNav("/orders")}
                      className="text-left text-base font-medium text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                    >
                      Meus Pedidos
                    </button>
                    {user.role === "ADMIN" && (
                      <button
                        onClick={() => handleNav("/admin")}
                        className="text-left text-base font-medium text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Painel Admin
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
}
