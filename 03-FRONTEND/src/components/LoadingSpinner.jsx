import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Spinner simple con animación
export const Spinner = ({ size = 24, className = '' }) => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		className={className}
	>
		<Loader2 size={size} className="animate-spin text-primary" />
	</motion.div>
);

// Spinner con texto
export const SpinnerWithText = ({ text = 'Cargando...', size = 24, className = '' }) => (
	<div className={`flex flex-col items-center gap-3 ${className}`}>
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
		>
			<Loader2 size={size} className="animate-spin text-primary" />
		</motion.div>
		<motion.p
			className="text-sm font-medium text-text-secondary"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.1 }}
		>
			{text}
		</motion.p>
	</div>
);

// Dots spinner
export const DotsSpinner = ({ className = '' }) => (
	<div className={`flex gap-1 ${className}`}>
		{[0, 1, 2].map((i) => (
			<motion.div
				key={i}
				className="w-2 h-2 bg-primary rounded-full"
				animate={{
					scale: [1, 1.5, 1],
					opacity: [1, 0.5, 1]
				}}
				transition={{
					duration: 0.8,
					repeat: Infinity,
					delay: i * 0.2
				}}
			/>
		))}
	</div>
);

// Pulse spinner
export const PulseSpinner = ({ size = 40, className = '' }) => (
	<motion.div
		className={`relative ${className}`}
		style={{ width: size, height: size }}
	>
		<motion.div
			className="absolute inset-0 bg-primary/20 rounded-full"
			animate={{
				scale: [1, 1.5, 1],
				opacity: [0.5, 0, 0.5]
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity
			}}
		/>
		<motion.div
			className="absolute inset-2 bg-primary/40 rounded-full"
			animate={{
				scale: [1, 1.3, 1],
				opacity: [0.7, 0, 0.7]
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				delay: 0.2
			}}
		/>
		<motion.div
			className="absolute inset-4 bg-primary rounded-full"
			animate={{
				scale: [1, 1.1, 1],
				opacity: [1, 0.8, 1]
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				delay: 0.4
			}}
		/>
	</motion.div>
);

// Progress bar
export const ProgressBar = ({ progress = 0, className = '', showPercentage = true }) => (
	<div className={`w-full ${className}`}>
		<div className="flex justify-between items-center mb-2">
			<span className="text-xs font-medium text-text-secondary">Progreso</span>
			{showPercentage && (
				<span className="text-xs font-medium text-text-primary">{Math.round(progress)}%</span>
			)}
		</div>
		<div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
			<motion.div
				className="h-full bg-primary rounded-full"
				initial={{ width: 0 }}
				animate={{ width: `${progress}%` }}
				transition={{ duration: 0.3, ease: 'easeOut' }}
			/>
		</div>
	</div>
);

// Linear progress bar (sin porcentaje)
export const LinearProgress = ({ className = '' }) => (
	<div className={`w-full h-1 bg-slate-200 rounded-full overflow-hidden ${className}`}>
		<motion.div
			className="h-full bg-primary rounded-full"
			animate={{
				x: ['-100%', '100%']
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				ease: 'linear'
			}}
		/>
	</div>
);

// Full page loading overlay
export const PageLoader = ({ text = 'Cargando...' }) => (
	<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className="text-center"
		>
			<PulseSpinner size={60} />
			<motion.p
				className="mt-4 text-sm font-medium text-text-secondary"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				{text}
			</motion.p>
		</motion.div>
	</div>
);

// Button loading state
export const ButtonLoader = ({ className = '' }) => (
	<motion.div
		className={`flex items-center justify-center ${className}`}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
	>
		<Loader2 size={16} className="animate-spin text-white" />
	</motion.div>
);

export default Spinner;
