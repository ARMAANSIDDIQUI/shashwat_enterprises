import { Menu, Smartphone } from "lucide-react";
import { FcStumbleupon } from "react-icons/fc";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

function MenuItems({ closeSheet }) {
  const navigate = useNavigate();

  const unauthMenuItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "products", label: "Products", path: "/listing" },
  ];

  function handleNavigate(getCurrentMenuItem) {
    navigate(getCurrentMenuItem.path);
    if (closeSheet) {
      closeSheet();
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {unauthMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function UnauthHeader() {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { showInstallButton, handleInstallClick } = usePWAInstall();

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <FcStumbleupon className="h-6 w-6" />
          <span className="font-bold">Shashwat Enterprises</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {showInstallButton && (
            <Button
              onClick={handleInstallClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 transition-all duration-300"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Download App</span>
              <span className="sm:hidden text-xs font-bold">App</span>
            </Button>
          )}

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <div className="lg:hidden">
            <Button onClick={() => navigate("/auth/login")}>Login</Button>
          </div>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSheetOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems closeSheet={() => setIsSheetOpen(false)} />
            <Button onClick={() => navigate("/auth/login")}>Login</Button>
          </SheetContent>
        </Sheet>
      </div>

        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <Button onClick={() => navigate("/auth/login")}>Login</Button>
        </div>
      </div>
    </header>
  );
}

export default UnauthHeader;
