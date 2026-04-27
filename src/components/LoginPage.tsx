import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      size === "default" && "h-10 px-4 py-2",
      size === "sm" && "h-9 px-3",
      size === "lg" && "h-11 px-8",
      className
    )}
    ref={ref}
    {...props}
  />
));
Button.displayName = "Button";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Globe = () => (
  <>
    <style>{`
      @keyframes earthRotate {
        0%   { background-position: 0 0; }
        100% { background-position: 400px 0; }
      }
      @keyframes twinkling      { 0%,100%{opacity:0.1;} 50%{opacity:1;} }
      @keyframes twinkling-slow { 0%,100%{opacity:0.1;} 50%{opacity:1;} }
      @keyframes twinkling-long { 0%,100%{opacity:0.1;} 50%{opacity:1;} }
      @keyframes twinkling-fast { 0%,100%{opacity:0.1;} 50%{opacity:1;} }
    `}</style>
    <div
      className="relative w-[220px] h-[220px] rounded-full overflow-hidden"
      style={{
        boxShadow:
          "0 0 20px rgba(255,255,255,0.2), -5px 0 8px #c3f4ff inset, 15px 2px 25px #000 inset, -24px -2px 34px #c3f4ff99 inset, 250px 0 44px #00000066 inset, 150px 0 38px #000000aa inset",
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/globe.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "left",
        animation: "earthRotate 30s linear infinite",
      }}
    >
      <div className="absolute left-[-20px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling 3s infinite" }} />
      <div className="absolute left-[-40px] top-[30px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-slow 2s infinite" }} />
      <div className="absolute left-[350px] top-[90px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-long 4s infinite" }} />
      <div className="absolute left-[200px] top-[290px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling 3s infinite" }} />
      <div className="absolute left-[50px] top-[270px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-fast 1.5s infinite" }} />
      <div className="absolute left-[250px] top-[-50px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-long 4s infinite" }} />
      <div className="absolute left-[290px] top-[60px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-slow 2s infinite" }} />
    </div>
  </>
);

interface LoginPageProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onEmailAuth: () => void;
  onGoogleLogin: () => void;
  authError: string | null;
  authLoading: boolean;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  translations: any;
}

const LoginPage = ({
  email, setEmail, password, setPassword,
  onEmailAuth, onGoogleLogin,
  authError, authLoading, authMode, setAuthMode,
  translations,
}: LoginPageProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const t = translations?.auth || {};

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 login-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex flex-col md:flex-row bg-[#090b13] text-white shadow-2xl"
      >
        {/* Left side — Globe */}
        <div className="hidden md:flex w-1/2 h-[600px] flex-col items-center justify-center gap-8 border-r border-[#1f2130] bg-gradient-to-br from-[#0f1120] to-[#151929]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Globe />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-500">
              TravelSplit
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              {t.subtitle || "Divide gastos. Viaja sin límites."}
            </p>
          </motion.div>
        </div>

        {/* Right side — Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {authMode === "login" ? (t.loginWelcome || "Bienvenido de nuevo") : (t.registerWelcome || "Únete")}
            </h1>
            <p className="text-gray-400 mb-8">
              {authMode === "login" ? (t.loginSubtitle || "Accede a tu cuenta") : (t.registerSubtitle || "Crea tu cuenta")}
            </p>

            <div className="mb-6">
              <button
                className="w-full flex items-center justify-center gap-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg p-3 hover:bg-[#1a1d2b] transition-all duration-300"
                onClick={onGoogleLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" fillOpacity=".54" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{t.google || "Continuar con Google"}</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2d3a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#090b13] text-gray-400">{t.orEmail || "o"}</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onEmailAuth(); }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  {t.emailLabel || "Email"} <span className="text-blue-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder || "tu@email.com"}
                  required
                  className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  {t.passwordLabel || "Contraseña"} <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passPlaceholder || "••••••••"}
                    required
                    className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {authError}
                </div>
              )}

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={authLoading}
                  className={cn(
                    "w-full bg-gradient-to-r relative overflow-hidden from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-lg transition-all duration-300",
                    isHovered ? "shadow-lg shadow-blue-500/25" : ""
                  )}
                >
                  <span className="flex items-center justify-center">
                    {authLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {authMode === "login" ? (t.login || "Entrar") : (t.register || "Registrarse")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </span>
                  {isHovered && !authLoading && (
                    <motion.span
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ filter: "blur(8px)" }}
                    />
                  )}
                </Button>
              </motion.div>

              <div className="text-center mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); }}
                  className="text-gray-400 hover:text-white text-sm transition-colors uppercase tracking-widest font-bold"
                >
                  {authMode === "login" ? (t.noAccount || "¿Sin cuenta? Regístrate") : (t.hasAccount || "¿Ya tienes cuenta? Entra")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
