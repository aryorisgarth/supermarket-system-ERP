import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Store } from 'lucide-react';
import AuthService from '../services/AuthService';
import { getDefaultPathForRole } from '../utils/authRoutes';
import ThemeToggle from '../components/ThemeToggle';
import Swal from 'sweetalert2';
import LoginBrandPanel from '../components/auth/LoginBrandPanel';
import DemoAccountsPanel from '../components/auth/DemoAccountsPanel';
import LoginForm from '../components/auth/LoginForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [resetEmail, setResetEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [showDemo, setShowDemo] = useState(false);
	const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
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
			if (error.message === 'PASSWORD_CHANGE_REQUIRED') {
				Swal.fire({
					icon: 'info',
					title: 'Contraseña temporal detectada',
					text: 'Es necesario que cambies tu contraseña temporal por una nueva para poder acceder al sistema de forma segura.',
					confirmButtonText: 'Configurar contraseña',
					confirmButtonColor: '#0F4C81',
					allowOutsideClick: false,
				}).then((result) => {
					if (result.isConfirmed) {
						AuthService.changePasswordViaKeycloak();
					}
				});
				return;
			}
			Swal.fire({
				icon: 'error',
				title: 'No se pudo iniciar sesión',
				text: error?.message || 'Verifica tus credenciales o la configuración de Keycloak.',
				confirmButtonColor: '#0F4C81',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = async (e) => {
		e.preventDefault();
		if (!resetEmail.trim()) {
			Swal.fire('Correo requerido', 'Por favor, ingresa tu dirección de correo electrónico.', 'warning');
			return;
		}
		try {
			setLoading(true);
			await AuthService.forgotPassword(resetEmail.trim());
			Swal.fire({
				icon: 'success',
				title: '¡Solicitud Procesada!',
				text: 'Si el correo electrónico está registrado, recibirás un enlace de restablecimiento de contraseña en los próximos minutos.',
				confirmButtonColor: '#0F4C81',
			});
			setIsForgotPasswordMode(false);
			setResetEmail('');
		} catch (error) {
			console.error(error);
			Swal.fire({
				icon: 'error',
				title: 'Error al enviar solicitud',
				text: error?.response?.data?.message || 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.',
				confirmButtonColor: '#0F4C81',
			});
		} finally {
			setLoading(false);
		}
	};

	const fillDemo = (account) => {
		setEmail(account.email);
		setPassword(account.pass);
		setIsForgotPasswordMode(false);
	};

	return (
		<div className="login-page min-h-[100dvh] flex flex-col lg:flex-row bg-[var(--app-bg)] transition-colors duration-200">
			<LoginBrandPanel />

			<div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-16 sm:py-16 lg:px-20 xl:px-24">
				<div className="absolute right-6 top-6 flex items-center gap-3">
					<ThemeToggle className="!h-10 !w-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm" />
				</div>
				
				<button
					type="button"
					onClick={() => navigate('/')}
					className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)] shadow-sm transition hover:border-[#0F4C81] hover:text-[#0F4C81] hover:shadow"
				>
					<ArrowLeft size={14} />
					Volver a Landing
				</button>

				<div className="mb-8 flex items-center gap-3 lg:hidden mt-8">
					<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81] text-white shadow-md">
						<Store size={20} />
					</span>
					<div>
						<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
							SuperNova POS
						</p>
						<h1 className="text-md font-bold text-[var(--app-text)]">
							{isForgotPasswordMode ? 'Recuperación' : 'Iniciar Sesión'}
						</h1>
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
					</div>

					{isForgotPasswordMode ? (
						<ForgotPasswordForm
							email={resetEmail}
							setEmail={setResetEmail}
							loading={loading}
							onSubmit={handleForgotPassword}
							onToggleLogin={() => setIsForgotPasswordMode(false)}
						/>
					) : (
						<LoginForm
							email={email}
							setEmail={setEmail}
							password={password}
							setPassword={setPassword}
							loading={loading}
							onSubmit={handleLogin}
							onToggleForgotPassword={() => setIsForgotPasswordMode(true)}
						/>
					)}

					<DemoAccountsPanel
						showDemo={showDemo}
						setShowDemo={setShowDemo}
						onSelectAccount={fillDemo}
					/>

					<p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--app-text-muted)]">
						SuperNova POS Suite v1.0
					</p>
				</motion.div>
			</div>
		</div>
	);
};

export default Login;
