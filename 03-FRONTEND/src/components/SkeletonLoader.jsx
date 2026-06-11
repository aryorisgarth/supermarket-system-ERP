import React from 'react';

const SkeletonLoader = ({ 
	className = '', 
	variant = 'default', 
	width, 
	height, 
	count = 1,
	animate = true 
}) => {
	const baseClasses = 'bg-slate-200 rounded';
	const animationClass = animate ? 'animate-pulse' : '';
	
	const variants = {
		default: 'rounded-md',
		circle: 'rounded-full',
		rounded: 'rounded-lg',
		text: 'rounded-sm h-4',
		avatar: 'rounded-full w-10 h-10',
		button: 'rounded-md h-10',
		card: 'rounded-lg'
	};

	const variantClass = variants[variant] || variants.default;
	const style = {
		width: width || (variant === 'avatar' ? '40px' : undefined),
		height: height || (variant === 'avatar' ? '40px' : (variant === 'button' ? '40px' : undefined))
	};

	const renderSkeleton = () => (
		<div 
			className={`${baseClasses} ${variantClass} ${animationClass} ${className}`}
			style={style}
		/>
	);

	if (count > 1) {
		return (
			<div className={`space-y-2 ${className}`}>
				{Array.from({ length: count }).map((_, index) => (
					<div key={index} style={index === count - 1 ? style : undefined}>
						{renderSkeleton()}
					</div>
				))}
			</div>
		);
	}

	return renderSkeleton();
};

// Componentes especializados
export const SkeletonCard = ({ className = '' }) => (
	<div className={`bg-white rounded-lg shadow-enterprise border border-border-light p-6 ${className}`}>
		<SkeletonLoader variant="circle" width={48} height={48} className="mb-4" />
		<SkeletonLoader variant="text" width="60%" className="mb-2" />
		<SkeletonLoader variant="text" width="40%" className="mb-4" />
		<SkeletonLoader variant="button" width="100%" />
	</div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
	<div className="space-y-3">
		{/* Header */}
		<div className="flex gap-4 pb-2 border-b border-border-light">
			{Array.from({ length: columns }).map((_, index) => (
				<SkeletonLoader key={`header-${index}`} variant="text" width="20%" />
			))}
		</div>
		{/* Rows */}
		{Array.from({ length: rows }).map((_, rowIndex) => (
			<div key={`row-${rowIndex}`} className="flex gap-4 py-2">
				{Array.from({ length: columns }).map((_, colIndex) => (
					<SkeletonLoader key={`cell-${rowIndex}-${colIndex}`} variant="text" width="20%" />
				))}
			</div>
		))}
	</div>
);

export const SkeletonList = ({ count = 5 }) => (
	<div className="space-y-4">
		{Array.from({ length: count }).map((_, index) => (
			<div key={index} className="flex items-center gap-4">
				<SkeletonLoader variant="avatar" />
				<div className="flex-1 space-y-2">
					<SkeletonLoader variant="text" width="60%" />
					<SkeletonLoader variant="text" width="40%" />
				</div>
			</div>
		))}
	</div>
);

export const SkeletonDashboard = () => (
	<div className="space-y-6">
		{/* Stats Cards */}
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{Array.from({ length: 4 }).map((_, index) => (
				<SkeletonCard key={`stat-${index}`} />
			))}
		</div>
		
		{/* Chart Section */}
		<div className="bg-white rounded-lg shadow-enterprise border border-border-light p-6">
			<SkeletonLoader variant="text" width="30%" className="mb-6" />
			<div className="h-64">
				<SkeletonLoader className="h-full" />
			</div>
		</div>
		
		{/* Recent Activity */}
		<div className="bg-white rounded-lg shadow-enterprise border border-border-light p-6">
			<SkeletonLoader variant="text" width="30%" className="mb-6" />
			<SkeletonList count={5} />
		</div>
	</div>
);

export default SkeletonLoader;
