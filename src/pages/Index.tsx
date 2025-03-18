
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ListPlus, LayoutDashboard, UserPlus, LogIn, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Index = () => {
  const { isAuthenticated } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 page-transition" style={{ paddingBottom: '5rem' }}>
      <div className="w-full max-w-md">
        <div className="glass-card p-8 mb-8 text-center animate-blur-in">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-gradient">ListaAi</h1>
          <p className="text-muted-foreground mb-8">
            Crie sua lista personalizada e compartilhe com quem desejar
          </p>
          
          <div className="grid gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button className="w-full btn-primary gap-2">
                    <LayoutDashboard size={18} />
                    <span>Meu Painel</span>
                  </Button>
                </Link>
                
                <Link to="/create">
                  <Button variant="outline" className="w-full btn-secondary gap-2">
                    <ListPlus size={18} />
                    <span>Criar Nova Lista</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="w-full btn-primary gap-2">
                    <LogIn size={18} />
                    <span>Entrar</span>
                  </Button>
                </Link>
                
                <Link to="/register">
                  <Button variant="outline" className="w-full btn-secondary gap-2">
                    <UserPlus size={18} />
                    <span>Criar Conta</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-medium mb-4 text-center">Tipos de Lista</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-24 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop" 
                  alt="Lista de Casamento" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white font-medium">Casamento</h3>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-24 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1770&auto=format&fit=crop" 
                  alt="Chá de Bebê" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white font-medium">Chá de Bebê</h3>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-24 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop" 
                  alt="Aniversário" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white font-medium">Aniversário</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link to={isAuthenticated ? "/create" : "/register"}>
              <Button variant="outline" size="sm" className="gap-2">
                <Gift size={16} />
                <span>Criar sua lista personalizada</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>ListaAi - Seu gerenciador de listas de presentes</p>
          <p className="mt-1">Crie e compartilhe suas listas facilmente.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
