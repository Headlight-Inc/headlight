import React from "react";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "success" | "warning" | "error" | "neutral" | "info" | "purple";
	size?: "sm" | "md";
	dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "neutral",
	size = "md",
	dot = false,
}) => {
	const styles = {
		success: "bg-emerald-50 text-emerald-700 border-emerald-200",
		warning: "bg-amber-50 text-amber-700 border-amber-200",
		error: "bg-rose-50 text-rose-700 border-rose-200",
		neutral: "bg-gray-100 text-gray-600 border-gray-200",
		info: "bg-sky-50 text-sky-700 border-sky-200",
		purple: "bg-purple-50 text-purple-700 border-purple-200",
	};

	const dotColors = {
		success: "bg-emerald-500",
		warning: "bg-amber-500",
		error: "bg-rose-500",
		neutral: "bg-gray-500",
		info: "bg-sky-500",
		purple: "bg-purple-500",
	};

	const sizes = {
		sm: "text-[10px] px-1.5 py-0.5",
		md: "text-xs px-2 py-0.5",
	};

	return (
		<span
			className={`inline-flex items-center font-medium rounded-full border ${styles[variant]} ${sizes[size]}`}
		>
			{dot && (
				<span
					className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`}
				/>
			)}
			{children}
		</span>
	);
};
