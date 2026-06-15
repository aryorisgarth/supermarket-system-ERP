import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginForm = ({
	email,
	setEmail,
	password,
	setPassword,
	loading,
	onSubmit,
	onToggleForgotPassword
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="space-y-6">
			<div className="hidden lg:block">
				<h2 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Acceso al Sistema</h2>
				<p className="mt-2 text-sm text-[var(--app-text-soft)] leading-relaxed">
					Ingresa tus credenciales autorizadas por el administrador.
				</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-5">
				<div className="space-y-2">
					<label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)]">
						Correo Electrónico
					</label>
					<div className="relative flex items-center">
						<User size={18} className="absolute left-4 text-[var(--app-text-muted)] pointer-events-none" />
						<input
							id="login-email"
							type="email"
							required
							autoComplete="username"
							className="w-full h-12 pl-11 pr-4 text-sm font-semibold rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
							placeholder="usuario@supermarket.local"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)]">
							Contraseña
						</label>
						<button
							type="button"
							onClick={onToggleForgotPassword}
							className="text-[11px] font-bold uppercase tracking-wider text-[#0F4C81] hover:text-[#0B3961] transition cursor-pointer"
						>
							¿Olvidaste tu contraseña?
						</button>
					</div>
					<div className="relative flex items-center">
						<Lock size={18} className="absolute left-4 text-[var(--app-text-muted)] pointer-events-none" />
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							required
							autoComplete="current-password"
							className="w-full h-12 pl-11 pr-12 text-sm font-semibold rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
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
					className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#0F4C81] text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0F4C81]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#0B3961] disabled:opacity-50 cursor-pointer"
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
		</div>
	);
};

export default LoginForm;
