import * as React from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  return <div onClick={() => setIsOpen(true)}>{children}</div>;
}

export function DropdownMenuContent({
  children,
  align = "end",
}: DropdownMenuContentProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignClass =
    align === "end"
      ? "right-0"
      : align === "start"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={ref}
      className={`absolute ${alignClass} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
    >
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({ children, onClick }: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      role="menuitem"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-100 my-1" />;
}
