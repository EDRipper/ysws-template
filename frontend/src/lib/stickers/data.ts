// Curated snapshot of Hack Club's public sticker catalog (see the reference
// peel-demo's stickers.json). Hardcoded rather than fetched live: this is a
// decorative hero element, not an exhaustive catalog browser, and a fixed
// list is one less runtime dependency on a third-party API staying up.
//
// Picked for visual variety: a mix of small single stickers, patches, and
// full stickersheets, and deliberately avoiding near-duplicate series (e.g.
// the many "Sticky Holidays - Day N" entries) so the field doesn't read as
// repetitive.
export interface StickerDef {
	id: string;
	name: string;
	image: string;
}

export const CURATED_STICKERS: StickerDef[] = [
	{
		id: 'rec0GL6IKM5n2JLuh',
		name: 'Jumpstart Planet Stickersheet',
		image:
			'https://cdn.hackclub.com/019d730d-eac2-7f56-87bf-b447a80b026f/Ib82nwh9dpS6pMUUKc5UyqRfra2hGuioZjikBfkObSc'
	},
	{
		id: 'rec0xDbwquq3PBSrU',
		name: 'Trashbeard',
		image:
			'https://cdn.hackclub.com/019d730c-5028-7f36-aab8-89f22e8ad348/8vDDsHlYHuYjqLORvS2y6mkL577OQ7Xhegfbesf1Wzo'
	},
	{
		id: 'rec0zXUXqc6jakG2L',
		name: 'Boba Drops',
		image:
			'https://cdn.hackclub.com/019d730a-9c86-70a5-a7b8-5dee27b5f67b/gV2GrpOYYMktbS1RCYmwyzH4G5uEdyzxv0aWYXuhvKc'
	},
	{
		id: 'rec1eZq6H7Klal5aU',
		name: 'AI Safety Meme',
		image:
			'https://cdn.hackclub.com/019d730a-622e-7a7b-9119-cd647ecff77a/Jij4KiSr4VPXBU6gr3wFEHAAva3sx3nXGDGoOSrfSUw'
	},
	{
		id: 'rec1zAvCMSebZVnC4',
		name: 'Juice Ticket',
		image:
			'https://cdn.hackclub.com/019d730c-fa9b-7645-891f-14e5fa53773a/X6OE-AbFR9MYaiRb9cUGxMJXGnW_BWthMkIMpernl9Y'
	},
	{
		id: 'rec2UmqjnBMTiUFiG',
		name: 'Zephyr',
		image:
			'https://cdn.hackclub.com/019d730c-5ffd-7de3-8335-f3adbc3cc6bb/lA6aEiCwhbvfgruXUNUJ3qPRvJNDC0gWiIlznUoxbCg'
	},
	{
		id: 'rec37ivnl7lWClbjf',
		name: 'Construct Orpheus',
		image:
			'https://cdn.hackclub.com/019d730d-d6ef-7ba2-995c-cc4438c537c1/Kn_AJQgGyGCB_62Tos0xT3d8qG-361C_1PSUFAZ8pXA'
	},
	{
		id: 'rec3PTM5zvZSStkV5',
		name: 'Milkyway Coin',
		image:
			'https://cdn.hackclub.com/019d730d-5094-7a9f-9c91-a1da4b32e1d2/hMpF0hPFe9h08lgVzFGANVukwI0HdHiiyBG46rDVR5E'
	},
	{
		id: 'rec3QLHtXCg9GtrYc',
		name: 'OnBoard Holographic',
		image:
			'https://cdn.hackclub.com/019d730b-87d6-7d0b-a68e-aa6e30c877dd/QWJgU8qcOGvDDeSgINe3CozIqojbV-BcD_Wzcw8dhGs'
	},
	{
		id: 'rec3WPppkxwUW0fC2',
		name: 'Undertale',
		image:
			'https://cdn.hackclub.com/019d730c-5328-7180-871a-de18bbc5270e/lywHE0oLCvwUT6nrk-nd08O6AjP7XBN0VfMip8cQXjk'
	},
	{
		id: 'rec3iiSmjLHFeE8d0',
		name: 'Midnight Detective Crow',
		image:
			'https://cdn.hackclub.com/019d730d-bfed-7ca3-9407-0d7e4f2ed99f/CsJtVCGzwViWK0hsYRInsmIG3I7_hBGeZA0SUj3h32Q'
	},
	{
		id: 'rec3z4yjQ0U17RfNa',
		name: 'Hack Club HQ',
		image:
			'https://cdn.hackclub.com/019d730a-e75c-7147-b80f-91085e125238/-zuH2L68zlVoAgPPUnfLBNg_gqB4aN4R2B3Fq5sSr7c'
	},
	{
		id: 'rec4NDYM4GIGb3xoP',
		name: 'Agate Head Patch',
		image:
			'https://cdn.hackclub.com/019d730e-2c34-79a2-8744-0814cad4a4b5/TwbSxjRMSnyKzCtnbjHSN_Jptk2XXXOOWVupcpTiGE4'
	},
	{
		id: 'rec5L2bthIaFT296s',
		name: 'Cobalt Head Patch',
		image:
			'https://cdn.hackclub.com/019d730e-2fe3-79c9-8001-2f97db51f087/YmDKnLLL4zI0wFeh0kPJw8oVsPjECREhvCM4GJ0RFjo'
	},
	{
		id: 'rec6bmZ0MuM8GZ5pi',
		name: 'Pathfinder Map',
		image:
			'https://cdn.hackclub.com/019d730d-fde0-7b01-813f-bfdde1d01d8f/vkJV8QnhEIFbzvdgJ3Dnu2VHvn_usdJRf_mzC1gsiDo'
	},
	{
		id: 'rec6xRJwfaClqSh1p',
		name: 'Hack Cola',
		image:
			'https://cdn.hackclub.com/019d730a-eaf5-711f-9196-c3b5021c5b4f/ZLdwcaB7eVfe6fScCgfdfSWY-XLvp5Ido9JCV4wW8Lw'
	},
	{
		id: 'rec8NTgQFIk2f1GkL',
		name: 'Toybox Stickersheet',
		image:
			'https://cdn.hackclub.com/019d730d-40e8-764f-9940-7023618344b8/wQHLtAJ9hgWA1LEZNj2SFzLa7rynvJF4xx2IFFfp1LA'
	},
	{
		id: 'recEvlQJcHh96tdTZ',
		name: 'Macintosh',
		image:
			'https://cdn.hackclub.com/019d730b-6891-7e2f-94e7-7ae12c005aa0/kUZDRDYxRQYj81Y58kQx2IGDXuSCAj1HJmtkRtSPMU8'
	},
	{
		id: 'recFMpuKMyipL23Dk',
		name: 'Horizon Patch',
		image:
			'https://cdn.hackclub.com/019d730b-370d-7dd5-8758-4d46d98e8faf/IsKB1181qGABtg8sZxghHe2D5LwMKNcYB8dwiUQj9Xk'
	},
	{
		id: 'recGdTTz4XycbyxPl',
		name: 'Inside',
		image:
			'https://cdn.hackclub.com/019d730b-44d5-7dff-a0ac-98a3be898a20/mhABU_nGcch7Baek8TdOGxLTZzi0l8oiBBlweCJfKT8'
	},
	{
		id: 'recGoDoo9gXmDmIvJ',
		name: 'Hijack',
		image:
			'https://cdn.hackclub.com/019d730c-e14c-77f9-8f4e-83e5fefbc582/bljV5w1mK6fG4XSFEeoDGGL3QDZOHwMZZURXf_mcYes'
	},
	{
		id: 'recHxQUO0sQZCdOPy',
		name: 'Kawaii Hack Club',
		image:
			'https://cdn.hackclub.com/019d730b-513b-7efa-a4bb-0aebcfb397b7/3wqTb6Vzcjd7HVEovqW7zn7CM7RMwBf-u1nL_eGpR9M'
	},
	{
		id: 'recSAfUrgvjtCNIdK',
		name: 'Card Flight',
		image:
			'https://cdn.hackclub.com/019d730d-58a4-7cf4-b737-cbf885a4c87c/74Zn7sck4dpc9s9lnOGIDTlnwI8EW-xGo8SIrvbX6Bk'
	},
	{
		id: 'recSu1knIQ40LyBsI',
		name: 'Apocalypse',
		image:
			'https://cdn.hackclub.com/019d730a-7210-7aa1-9229-aef624199470/B3ia27Q5Fyq8U9rYXZT7_lwsb2Lm0SiRJRGF1mRR2SI'
	},
	{
		id: 'recUcLHPd4xLMSiyG',
		name: 'Svelte Coin',
		image:
			'https://cdn.hackclub.com/019d730e-0d4f-7fea-9db6-dfbcf48801df/JUR2oTOwoMSnpzydBquFH8wJRppoJEl-fPcX5B9jzXA'
	},
	{
		id: 'recB4arb9p0g3Y14W',
		name: 'Athena Sparkles',
		image:
			'https://cdn.hackclub.com/019d730a-8d16-7073-8667-50b3fa227eb0/Eco_a1NWe4Lz2Gsh1uBHv10wSuc9Fx-vcAk2aXzCoVc'
	}
];
