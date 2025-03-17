import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Ban } from 'lucide-react';
import Logo from '@/components/Logo';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Por favor, digite um email válido.",
  }),
  password: z.string().min(1, {
    message: "Por favor, digite sua senha.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage = () => {
  const { login, loading, dbConnected } = useUser();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-transition">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center text-center">
          <Logo size="md" className="mb-2" />
          <CardTitle className="text-2xl font-bold">Entrar na sua conta</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar suas listas
          </CardDescription>
          <div className="flex items-center gap-2 text-sm mt-2">
            {dbConnected ? (
              <>
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Conectado ao banco de dados</span>
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-500">Modo offline (sem banco de dados)</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground">
            Não possui uma conta?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
