import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
	type = 'info', 
	message, 
	onClose, 
	duration = 4000,
	position = 'top-right'
}) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(onClose, 300);
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	const icons = {
		success: <CheckCircle size={20} className="text-success" />,
		error: <XCircle size={20} className="text-danger" />,
		warning: <AlertCircle size={20} className="text-warning" />,
		info: <Info size={20} className="text-primary" />
	};

	const colors = {
		success: 'bg-white border-l-4 border-success',
		error: 'bg-white border-l-4 border-danger',
		warning: 'bg-white border-l-4 border-warning',
		info: 'bg-white border-l-4 border-primary'
	};

	const positions = {
		'top-right': 'fixed top-4 right-4 z-50',
		'top-left': 'fixed top-4 left-4 z-50',
		'bottom-right': 'fixed bottom-4 right-4 z-50',
		'bottom-left': 'fixed bottom-4 left-4 z-50',
		'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
		'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0, y: position.includes('top') ? -50 : 50 }}
					animate={{ opacity: 1, x: 0, y: 0 }}
					exit={{ opacity: 0, x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0, y: position.includes('top') ? -50 : 50 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className={`${positions[position]} ${colors[type]} shadow-enterprise rounded-lg p-4 min-w-[320px] max-w-md`}
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-0.5">
							{icons[type]}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-text-primary">{message}</p>
						</div>
						<button
							onClick={() => {
								setIsVisible(false);
								setTimeout(onClose, 300);
							}}
							className="flex-shrink-0 text-text-muted hover:text-text-secondary transition-colors"
						>
							<X size={16} />
						</button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

// Toast Container para manejar múltiples toasts
export const ToastContainer = ({ toasts, removeToast }) => {
	const position = toasts.length > 0 ? toasts[0].position : 'top-right';
	
	return (
		<div className={`${position === 'top-right' ? 'fixed top-4 right-4 z-50' : position === 'top-left' ? 'fixed top-4 left-4 z-50' : position === 'bottom-right' ? 'fixed bottom-4 right-4 z-50' : position === 'bottom-left' ? 'fixed bottom-4 left-4 z-50' : position === 'top-center' ? 'fixed top-4 left-1/2 -translate-x-1/2 z-50' : 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50'} space-y-2`}>
			<AnimatePresence mode="popLayout">
				{toasts.map((toast) => (
					<motion.div
						key={toast.id}
						initial={{ opacity: 0, y: -20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.2 }}
					>
						<Toast
							type={toast.type}
							message={toast.message}
							onClose={() => removeToast(toast.id)}
							duration={toast.duration}
							position={toast.position}
						/>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};

// Hook para usar toasts en cualquier componente
let toastId = 0;
const toastListeners = new Set();

export const useToast = () => {
	const [toasts, setToasts] = useState([]);

	useEffect(() => {
		toastListeners.add(setToasts);
		return () => toastListeners.delete(setToasts);
	}, []);

	const addToast = (type, message, options = {}) => {
		const id = ++toastId;
		const newToast = {
			id,
			type,
			message,
			duration: options.duration || 4000,
			position: options.position || 'top-right'
		};

		setToasts(prev => [...prev, newToast]);

		if (options.duration !== 0) {
			setTimeout(() => {
				removeToast(id);
			}, options.duration || 4000);
		}

		return id;
	};

	const removeToast = (id) => {
		setToasts(prev => prev.filter(t => t.id !== id));
	};

	const success = (message, options) => addToast('success', message, options);
	const error = (message, options) => addToast('error', message, options);
	const warning = (message, options) => addToast('warning', message, options);
	const info = (message, options) => addToast('info', message, options);

	return { toasts, success, error, warning, info, removeToast };
};

export default Toast;
