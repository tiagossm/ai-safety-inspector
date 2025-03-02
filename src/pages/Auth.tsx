
import { Shield } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { SessionChecker } from "@/components/auth/SessionChecker";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    isSignUp,
    setIsSignUp,
    handleAuth,
    handleUserRedirect
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SessionChecker handleUserRedirect={handleUserRedirect} />
      
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-primary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? "Criar nova conta" : "Entrar na plataforma"}
          </h2>
        </div>
        
        <AuthForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          handleAuth={handleAuth}
        />
      </div>
    </div>
  );
};

export default Auth;
