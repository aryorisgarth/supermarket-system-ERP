import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Briefcase, TrendingUp } from 'lucide-react';

const DEMO_ACCOUNTS = [
	{ role: 'Ingeniero', email: 'admin@supermarket.local', pass: 'Admin12345!', icon: Shield, color: 'from-blue-500 to-indigo-600' },
	{ role: 'Cajero', email: 'cajero@supermarket.local', pass: 'Cajero12345!', icon: CreditCard, color: 'from-emerald-500 to-teal-600' },
	{ role: 'Supervisor', email: 'supervisor@supermarket.local', pass: 'Supervisor12345!', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
	{ role: 'Consultor', email: 'consultor@supermarket.local', pass: 'Consultor12345!', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
];

const DemoAccountsPanel = ({ showDemo, setShowDemo, onSelectAccount }) => {
	return (
		<div className="mt-8 border-t border-[var(--app-border)] pt-6">
			<button
				type="button"
				onClick={() => setShowDemo((v) => !v)}
				className="w-full text-center text-xs font-black uppercase tracking-wider text-[#0F4C81] hover:text-[#0B3961] transition"
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
									onClick={() => onSelectAccount(acc)}
									className="flex flex-col items-start rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-left transition hover:border-[#0F4C81] hover:shadow-md group"
								>
									<span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${acc.color} text-white`}>
										<RoleIcon size={14} />
									</span>
									<span className="mt-2.5 block text-xs font-black text-[var(--app-text)] group-hover:text-[#0F4C81] transition">{acc.role}</span>
									<span className="mt-0.5 block w-full truncate text-[9px] font-bold text-[var(--app-text-muted)]">{acc.email}</span>
								</button>
							);
						})}
					</div>
				</motion.div>
			)}
		</div>
	);
};

export default DemoAccountsPanel;
