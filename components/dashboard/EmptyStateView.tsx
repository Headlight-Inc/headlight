import React from "react";

export const EmptyStateView = ({
	title,
	icon,
	desc,
}: {
	title: string;
	icon: any;
	desc: string;
}) => (
	<div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-[#0F0F0F] rounded-3xl border border-white/5 border-dashed">
		<div className="p-6 rounded-full bg-white/5 text-gray-500 mb-6">{icon}</div>
		<h2 className="text-2xl font-bold font-heading text-white mb-2">{title}</h2>
		<p className="text-gray-500 max-w-md mb-8">{desc}</p>
		<button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
			Setup Now
		</button>
	</div>
);
