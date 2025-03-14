
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ListPlus, LayoutDashboard, UserPlus, LogIn, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { mockTemplates } from '@/lib/mockData';

const Index = () => {
  const { isAuthenticated } = useUser();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

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
          <h2 className="text-xl font-medium mb-4 text-center">Templates Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockTemplates.map((template) => (
              <div 
                key={template.id}
                className="rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md relative"
                onMouseEnter={() => setPreviewTemplate(template.id)}
                onMouseLeave={() => setPreviewTemplate(null)}
              >
                <div className="relative h-24 overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-white font-medium">{template.title}</h3>
                  </div>
                </div>
                {previewTemplate === template.id && (
                  <div className="p-2 text-xs bg-white bg-opacity-90 absolute top-full left-0 right-0 rounded-md shadow-sm z-10">
                    <p>{template.description}</p>
                    <p className="mt-1 text-muted-foreground">{template.items.length} itens inclusos</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to={isAuthenticated ? "/create" : "/register"}>
              <Button variant="outline" size="sm" className="gap-2">
                <Gift size={16} />
                <span>Comece com um template</span>
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
