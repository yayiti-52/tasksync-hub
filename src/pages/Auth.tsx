import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const displayNameSchema = z.string().min(2, 'Display name must be at least 2 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (!isLogin) {
      const displayNameResult = displayNameSchema.safeParse(displayName);
      if (!displayNameResult.success) {
        newErrors.displayName = displayNameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Account exists',
              description: 'An account with this email already exists. Please log in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to TaskHive. You are now logged in.',
          });
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Corner Ornaments */}
      <div className="absolute top-8 left-8 text-4xl text-primary/20 font-ornate select-none">❧</div>
      <div className="absolute top-8 right-8 text-4xl text-primary/20 font-ornate select-none rotate-180">❧</div>
      <div className="absolute bottom-8 left-8 text-4xl text-primary/20 font-ornate select-none -rotate-90">❧</div>
      <div className="absolute bottom-8 right-8 text-4xl text-primary/20 font-ornate select-none rotate-90">❧</div>

      {/* Decorative Background Shapes */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-vintage-burgundy/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-vintage-ochre/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vintage-gold/3 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="art-frame">
              <div className="w-14 h-14 flex items-center justify-center">
                <span className="font-display font-bold text-2xl text-primary">T</span>
              </div>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2 tracking-tight">
            TaskHive
          </h1>
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <span className="text-primary/40">✦</span>
            <p className="font-ornate text-lg italic">
              {isLogin ? 'Welcome back, dear artisan' : 'Begin your creative journey'}
            </p>
            <span className="text-primary/40">✦</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="art-frame animate-fade-in">
          <div className="p-8">
            {/* Decorative Header Line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-primary/60 text-sm font-ornate tracking-widest uppercase">
                {isLogin ? 'Sign In' : 'Register'}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="font-display text-sm">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your artistic name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`font-serif ${errors.displayName ? 'border-destructive' : ''}`}
                  />
                  {errors.displayName && (
                    <p className="text-xs text-destructive font-serif italic">{errors.displayName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-display text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="artist@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`font-serif ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-serif italic">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-display text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`font-serif ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && (
                  <p className="text-xs text-destructive font-serif italic">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                className="w-full font-display tracking-wide text-base py-5 mt-6" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isLogin ? 'Enter the Studio' : 'Join the Guild'}
              </Button>
            </form>

            {/* Decorative Footer Line */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-primary/40">❦</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-ornate italic"
              >
                {isLogin ? "New here? Create an account" : 'Already a member? Sign in'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8 font-ornate italic">
          {!isLogin && (
            <>
              <span className="text-primary/40 mr-2">✦</span>
              The first artisan becomes the guild master
              <span className="text-primary/40 ml-2">✦</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;