import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Store,
  Lock,
  Eye,
  EyeOff,
  User,
  Box,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import AuthService from '../services/AuthService';
import { getDefaultPathForRole } from '../utils/authRoutes';
import ThemeToggle from '../components/ThemeToggle';
import Swal from 'sweetalert2';

const DEMO_ACCOUNTS = [
  { role: 'Ingeniero', email: 'admin@supermarket.local', pass: 'Admin12345!', icon: Shield, color: 'from-blue-500 to-indigo-600' },
  { role: 'Cajero', email: 'cajero@supermarket.local', pass: 'Cajero12345!', icon: CreditCard, color: 'from-emerald-500 to-teal-600' },
  { role: 'Supervisor', email: 'supervisor@supermarket.local', pass: 'Supervisor12345!', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
  { role: 'Consultor', email: 'consultor@supermarket.local', pass: 'Consultor12345!', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
];

const features = [
  { icon: Box, text: 'Inventario en tiempo real' },
  { icon: CreditCard, text: 'Facturación POS integrada' },
  { icon: BarChart3, text: 'Reportes y paneles por rol' },
  { icon: ShieldCheck, text: 'Acceso seguro por permisos' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      AuthService.refreshCurrentUser().then((user) => {
        const roleName = user?.role?.name || AuthService.getCurrentUser()?.role?.name;
        navigate(getDefaultPathForRole(roleName), { replace: true });
      });
    }
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 19) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (AuthService.isAuthenticated()) {
        const user = await AuthService.refreshCurrentUser();
        const roleName = user?.role?.name || AuthService.getCurrentUser()?.role?.name;
        navigate(getDefaultPathForRole(roleName), { replace: true });
        return;
      }
      await AuthService.loginDirect(email.trim(), password);
      
      Swal.fire({
        icon: 'success',
        title: '¡Ingreso Exitoso!',
        text: 'Sesión iniciada correctamente. Autenticación verificada y protegida de forma segura mediante Keycloak 🔒',
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1800);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo iniciar sesión',
        text: error?.message || 'Verifica tus credenciales o la configuración de Keycloak.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.pass);
  };

  return (
    <div className="login-page min-h-[100dvh] flex flex-col lg:flex-row bg-[var(--app-bg)] transition-colors duration-200">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col justify-between overflow-hidden p-12 xl:p-16 bg-slate-950 text-white"
      >
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-90 w-90 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Store size={24} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Enterprise Edition</p>
              <h1 className="text-xl font-black tracking-tight text-white leading-none mt-1">SuperNova</h1>
            </div>
          </div>

          <div className="mt-14 max-w-md">
            <h2 className="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Simplifica la gestión de tu supermercado
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Conecta caja, inventario, lotes y facturación en un ecosistema robusto diseñado para la eficiencia operativa.
            </p>
          </div>
        </div>

        <div className="relative z-10 my-8">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-4">Características Clave</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm transition duration-300 hover:border-blue-500/35 hover:bg-white/[0.05]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={18} />
                </span>
                <span className="text-xs font-semibold text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-xs font-semibold text-slate-500">
          <span>SuperNova POS Suite v1.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </motion.aside>

      <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-16 sm:py-16 lg:px-20 xl:px-24">
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <ThemeToggle className="!h-10 !w-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm" />
        </div>
        
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--app-text-soft)] shadow-sm transition hover:border-blue-500 hover:text-blue-500 hover:shadow"
        >
          <ArrowLeft size={14} />
          Volver a Landing
        </button>

        <div className="mb-8 flex items-center gap-3 lg:hidden mt-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Store size={20} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
              SuperNova POS
            </p>
            <h1 className="text-md font-black text-[var(--app-text)]">Iniciar Sesión</h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto w-full max-w-[420px]"
        >
          <div className="hidden lg:block mb-8">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--app-primary)]">
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              {getGreeting()}
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--app-text)]">Acceso al Sistema</h2>
            <p className="mt-2 text-sm text-[var(--app-text-soft)] leading-relaxed">
              Ingresa tus credenciales autorizadas por el administrador.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-black uppercase tracking-wider text-[var(--app-text-soft)]">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-4 text-[var(--app-text-muted)] pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  className="w-full h-12 pl-11 pr-4 text-sm font-semibold rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="usuario@supermarket.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-xs font-black uppercase tracking-wider text-[var(--app-text-soft)]">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-[var(--app-text-muted)] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-11 pr-12 text-sm font-semibold rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 text-xs font-semibold leading-relaxed text-[var(--app-text-soft)] flex gap-3 items-start">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                🔒
              </span>
              <span>
                Protección mediante autenticación centralizada integrada.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--app-border)] pt-6">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="w-full text-center text-xs font-black uppercase tracking-wider text-blue-500 hover:text-blue-600 transition"
            >
              {showDemo ? 'Ocultar Accesos de Prueba' : 'Acceso Rápido de Prueba (Demo)'}
            </button>

            {showDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 overflow-hidden rounded-2.5xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4"
              >
                <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                  Selecciona un rol para autocompletar credenciales
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const RoleIcon = acc.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="flex flex-col items-start rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-left transition hover:border-blue-500 hover:shadow-md group"
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${acc.color} text-white`}>
                          <RoleIcon size={14} />
                        </span>
                        <span className="mt-2.5 block text-xs font-black text-[var(--app-text)] group-hover:text-blue-500 transition">{acc.role}</span>
                        <span className="mt-0.5 block w-full truncate text-[9px] font-bold text-[var(--app-text-muted)]">{acc.email}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.25em] text-[var(--app-text-muted)]">
            SuperNova POS Suite v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
