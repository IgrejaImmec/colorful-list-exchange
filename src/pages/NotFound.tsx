
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 page-transition">
      <div className="glass-card p-8 text-center max-w-md w-full animate-scale-in">
        <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
        <p className="text-lg text-muted-foreground mb-8">Página não encontrada</p>
        
        <Link to="/">
          <Button className="btn-primary gap-2">
            <ArrowLeft size={16} />
            <span>Voltar para o Início</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
