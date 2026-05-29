// Shared Tailwind class strings for the JobFinder (candidate-side) design.
// Keeps the teal/ink/cream visual language consistent across pages without a
// separate stylesheet. Compose with cn() when local overrides are needed.

export const ui = {
	// Buttons (h-10 default)
	btnPrimary:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-[18px] text-sm font-semibold text-white transition-colors hover:bg-black disabled:pointer-events-none disabled:opacity-50",
	btnAccent:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-500 px-[18px] text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:pointer-events-none disabled:opacity-50",
	btnOutline:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink bg-white px-[18px] text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-50",
	btnGhost:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-line-soft disabled:pointer-events-none disabled:opacity-50",
	iconBtn:
		"grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-slate-600 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40",

	// Surfaces / text
	card: "rounded-xl border border-line bg-white p-6",
	eyebrow:
		"inline-flex items-center gap-2 font-mono-jb text-xs font-semibold uppercase tracking-[0.12em] text-teal-700 before:inline-block before:h-[1.5px] before:w-6 before:rounded-sm before:bg-teal-500",
	h1: "font-display text-[clamp(32px,4vw,48px)] font-bold leading-none tracking-[-0.03em] text-ink",
	h2: "font-display text-[clamp(28px,4vw,42px)] font-bold leading-[1.05] tracking-[-0.025em] text-ink",
	sub: "mt-2.5 max-w-[520px] text-base text-slate-600",

	// Layout
	wrap: "mx-auto max-w-[1280px] px-7",
	section: "py-14",

	// Empty state
	empty: "flex flex-col items-center px-6 py-20 text-center",
	emptyIcon:
		"mb-5 grid h-18 w-18 place-items-center rounded-xl bg-cream-2 text-slate-400",

	// Rich-text (HTML description) rendered inside a white section
	richtext:
		"text-[15px] leading-7 text-slate-700 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-display [&_h1]:text-lg [&_h1]:text-ink [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-base [&_h2]:text-ink [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-ink [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_a]:text-teal-700 [&_a]:underline [&_strong]:font-bold [&_strong]:text-ink [&_b]:font-bold [&_b]:text-ink",
};

