
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLists } from '../context/ListsContext';
import { useList } from '../context/ListContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListPlus, Edit, Trash2, ExternalLink, Printer, RefreshCw, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';
import CreateListDialog from '@/components/CreateListDialog';

const Dashboard = () => {
  const { user, logout } = useUser();
  const { lists, loading, error, createNewList, deleteList, refreshLists, setPrinting } = useLists();
  const { loadListById } = useList();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      refreshLists();
    }
  }, [user, navigate]);

  const handleCreateList = async (title: string, description: string) => {
    setIsProcessing(true);
    
    try {
      const newListId = await createNewList(title, description);
      setIsCreateDialogOpen(false);
      
      // Load this list into the context and redirect to edit
      await loadListById(newListId);
      navigate('/create');
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewList = async (listId: string) => {
    await loadListById(listId);
    navigate('/view');
  };

  const handleEditList = async (listId: string) => {
    await loadListById(listId);
    navigate('/customize');
  };

  const handlePrintList = async (listId: string) => {
    await loadListById(listId);
    setPrinting(true);
    
    // Using setTimeout to make sure list loads before printing
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrinting(false), 500);
    }, 500);
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      await deleteList(listId);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ paddingBottom: '5rem' }}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Logo size="sm" />
            <h1 className="text-2xl font-bold ml-2">Meu Painel</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Olá, {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => refreshLists()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Minhas Listas</h2>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <ListPlus className="w-4 h-4 mr-2" />
              Nova Lista
            </Button>
            
            <CreateListDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSubmit={handleCreateList}
              isProcessing={isProcessing}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin opacity-70" />
              <p>Carregando suas listas...</p>
            </div>
          ) : lists.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma lista</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <ListPlus className="w-4 h-4 mr-2" />
                  Criar Primeira Lista
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <Card key={list.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{list.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {list.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      <p>Itens: {list.itemCount}</p>
                      <p>Reservados: {list.claimedCount}</p>
                      <p>Criada em: {new Date(list.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewList(list.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditList(list.id)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePrintList(list.id)}
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Imprimir
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
