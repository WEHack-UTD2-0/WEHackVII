interface FormGroupWrapperProps {
	title: string;
	children: React.ReactNode;
}

export default function FormGroupWrapper({
	children,
	title,
}: FormGroupWrapperProps) {
	return (
		<div className="relative rounded-xl border-2 border-[#538FDD] bg-[#060F38]/90 p-6 shadow-[4px_4px_0px_#538FDD]">
			<p className="absolute top-0 z-10 -translate-y-[20px] rounded-md border border-[#538FDD] bg-[#00072D] px-3 py-0.5 font-zen-maru text-xl font-bold tracking-wide text-[#EFB5D5] md:text-2xl">
				{title}
			</p>
			<div className="relative top-0 space-y-6 pt-2">{children}</div>
		</div>
	);
}