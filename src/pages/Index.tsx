
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ListPlus, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Index = () => {
  const { isAuthenticated } = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-transition" style={{ paddingBottom: '5rem' }}>
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
        
        <div className="text-center text-sm text-muted-foreground">
          <p>ListaAi - Seu gerenciador de listas de presentes</p>
          <p className="mt-1">Crie e compartilhe suas listas facilmente.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
