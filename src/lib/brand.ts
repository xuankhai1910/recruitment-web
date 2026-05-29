// Deterministic brand color + initials for logo blocks in the JobFinder design.
// Used when a company has no uploaded logo image.

const PALETTE = [
	"#14B8A6", // teal
	"#6366F1", // indigo
	"#FB7185", // rose
	"#F59E0B", // amber
	"#8B5CF6", // violet
	"#0EA5E9", // sky
	"#10B981", // emerald
	"#EC4899", // pink
	"#0F766E", // deep teal
	"#F97316", // orange
];

export function brandColor(seed?: string): string {
	if (!seed) return PALETTE[0];
	let h = 0;
	for (let i = 0; i < seed.length; i++) {
		h = (h * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return PALETTE[h % PALETTE.length];
}

export function brandShort(name?: string): string {
	if (!name) return "?";
	const words = name
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (words.length === 0) return "?";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
