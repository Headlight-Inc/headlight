import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "red";
	size?: "sm" | "md" | "lg";
	children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	size = "md",
	className = "",
	children,
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded uppercase tracking-wide text-xs";

	const variants = {
		primary:
			"bg-brand-teal text-white hover:bg-teal-600 shadow-sm active:bg-teal-700",
		red: "bg-brand-red text-white hover:bg-red-600 shadow-float hover:shadow-lg active:bg-red-700",
		secondary: "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200",
		outline:
			"bg-transparent border border-brand-teal text-brand-teal hover:bg-teal-50",
		ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900",
	};

	const sizes = {
		sm: "px-3 py-2",
		md: "px-6 py-3",
		lg: "px-8 py-4 text-sm",
	};

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};
