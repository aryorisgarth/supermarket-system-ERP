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
			className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col justify-between overflow-hidden p-12 xl:p-16 bg-[#0B5A8C] border-r border-[#084871] shadow-2xl text-white"
		>
			<div className="relative z-10">
				<div className="flex items-center gap-3">
					<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0B5A8C] shadow-md">
						<Store size={24} />
					</span>
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8CC4E6]">Enterprise Edition</p>
						<h1 className="text-xl font-bold tracking-tight text-white leading-none mt-1">SuperNova</h1>
					</div>
				</div>

				<div className="mt-14 max-w-md">
					<h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
						Simplifica la gestión de tu supermercado
					</h2>
					<p className="mt-4 text-sm leading-relaxed text-blue-100/80">
						Conecta caja, inventario, lotes y facturación en un ecosistema robusto diseñado para la eficiencia operativa.
					</p>
				</div>
			</div>

			<div className="relative z-10 my-8">
				<p className="text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-4">Características Clave</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{features.map(({ icon: Icon, text }) => (
						<div
							key={text}
							className="flex items-center gap-3 rounded-xl border border-[#126fa9] bg-[#084871] p-4 transition-all duration-300 hover:bg-[#073F63] shadow-sm"
						>
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B5A8C] text-[#8CC4E6] border border-[#126fa9]">
								<Icon size={18} />
							</span>
							<span className="text-xs font-semibold text-white">{text}</span>
						</div>
					))}
				</div>
			</div>

			<div className="relative z-10 flex items-center justify-between border-t border-[#126fa9] pt-6 text-xs font-semibold text-blue-200/60">
				<span>SuperNova POS Suite v1.0</span>
				<span>© {new Date().getFullYear()}</span>
			</div>
		</motion.aside>
	);
};

export default LoginBrandPanel;
