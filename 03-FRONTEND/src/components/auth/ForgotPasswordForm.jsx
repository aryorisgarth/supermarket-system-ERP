import React from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordForm = ({
	email,
	setEmail,
	loading,
	onSubmit,
	onToggleLogin
}) => {
	return (
		<div className="space-y-6">
			<div>
				<button
					type="button"
					onClick={onToggleLogin}
					className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0F4C81] hover:text-[#0B3961] transition cursor-pointer mb-4"
				>
					<ArrowLeft size={14} />
					Volver al Login
				</button>
				<h2 className="text-3xl font-black tracking-tight text-[var(--app-text)]">Recuperar Contraseña</h2>
				<p className="mt-2 text-sm text-[var(--app-text-soft)] leading-relaxed">
					Ingresa tu dirección de correo electrónico institucional para enviarte un enlace de restablecimiento seguro.
				</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-5">
				<div className="space-y-2">
					<label htmlFor="reset-email" className="block text-xs font-black uppercase tracking-wider text-[var(--app-text-soft)]">
						Correo Electrónico
					</label>
					<div className="relative flex items-center">
						<Mail size={18} className="absolute left-4 text-[var(--app-text-muted)] pointer-events-none" />
						<input
							id="reset-email"
							type="email"
							required
							className="w-full h-12 pl-11 pr-4 text-sm font-semibold rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
							placeholder="usuario@supermarket.local"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-semibold leading-relaxed text-amber-700 dark:text-amber-400 flex gap-3 items-start border-l-4 border-l-amber-500">
					<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
						✉️
					</span>
					<span>
						Se enviará un correo a través del servidor de Keycloak con las instrucciones necesarias. El enlace tendrá una validez temporal.
					</span>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#0F4C81] text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#0F4C81]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#0B3961] disabled:opacity-50 cursor-pointer"
				>
					{loading ? (
						<span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
					) : (
						<>
							Enviar Enlace
							<Send size={16} />
						</>
					)}
				</button>
			</form>
		</div>
	);
};

export default ForgotPasswordForm;
