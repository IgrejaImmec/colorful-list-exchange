
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Paintbrush, Eye, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useLists } from '../context/ListsContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useUser();
  const { isPrinting } = useLists();
  
  // Don't show navbar in print mode
  if (isPrinting) return null;
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 glass-card px-6 py-4 flex items-center justify-center gap-8 animate-fade-in no-print">
      <Link to="/" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
        <Home size={20} className="mb-1" />
        <span className="text-xs font-medium">Início</span>
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/dashboard') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <LayoutDashboard size={20} className="mb-1" />
            <span className="text-xs font-medium">Painel</span>
          </Link>
          
          <Link to="/create" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/create') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <List size={20} className="mb-1" />
            <span className="text-xs font-medium">Criar</span>
          </Link>
          
          <Link to="/customize" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/customize') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <Paintbrush size={20} className="mb-1" />
            <span className="text-xs font-medium">Estilo</span>
          </Link>
          
          <Link to="/view" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/view') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <Eye size={20} className="mb-1" />
            <span className="text-xs font-medium">Visualizar</span>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/login') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <LogIn size={20} className="mb-1" />
            <span className="text-xs font-medium">Entrar</span>
          </Link>
          
          <Link to="/register" className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive('/register') ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <UserPlus size={20} className="mb-1" />
            <span className="text-xs font-medium">Cadastrar</span>
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
