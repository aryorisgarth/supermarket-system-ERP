import React from 'react';
import { motion } from 'framer-motion';
import { Store, Box, CreditCard, BarChart3, ShieldCheck } from 'lucide-react';

const features = [
	{ icon: Box, text: 'Inventario en tiempo real' },
	{ icon: CreditCard, text: 'Facturación POS integrada' },
	{ icon: BarChart3, text: 'Reportes y paneles por rol' },
	{ icon: ShieldCheck, text: 'Acceso seguro por permisos' },
];

const LoginBrandPanel = () => {
	return (
		<motion.aside
			initial={{ opacity: 0, x: -30 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col justify-between overflow-hidden p-12 xl:p-16 bg-slate-950 text-white"
		>
			<div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#0F4C81]/25 blur-3xl" />
			<div className="absolute -right-20 -bottom-20 h-90 w-90 rounded-full bg-[#0F4C81]/15 blur-3xl" />
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

			<div className="relative z-10">
				<div className="flex items-center gap-3">
					<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C81] text-white shadow-lg shadow-[#0F4C81]/20">
						<Store size={24} />
					</span>
					<div>
						<p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84b2db]">Enterprise Edition</p>
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
							className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm transition duration-300 hover:border-[#0F4C81]/35 hover:bg-white/[0.05]"
						>
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C81]/10 text-[#84b2db]">
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
	);
};

export default LoginBrandPanel;
