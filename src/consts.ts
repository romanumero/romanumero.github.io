export const SITE = {
	title: 'Engineering the Modern Agency',
	description:
		'Practical notes on AI, automation, measurement and leadership for agency owners, by Damon Henry.',
	author: 'Damon Henry',
	authorRole: 'Founder, KORTX',
	// Kit form IDs (Kit → Grow → Landing Pages & Forms → open a form → the number in its URL).
	// Each form redirects to /thanks/?list=… after signup (set in the form's Settings in Kit).
	// While an ID is empty, that signup falls back to an email link.
	kitForms: {
		newsletter: '9973059', // EMA – Newsletter
		cohort: '9973069', // EMA – Cohort waitlist
		toolkits: '9973074', // EMA – Toolkits waitlist
	},
	contactEmail: 'me@damonhenry.com', // routed to damon@kortx.io by Google Workspace
	// Plausible's site-specific script URL (Site settings → Site installation, the src of the first
	// <script>, e.g. https://plausible.io/js/pa-XXXXXXXX.js). Loaded in production builds only; empty = off.
	plausibleScript: 'https://plausible.io/js/pa-cEnYJ7jncULpA6Cn-4DXT.js',
	social: {
		youtube: '', // TODO
		linkedin: 'https://www.linkedin.com/in/damonhenry/',
		x: 'https://x.com/romanumero',
	},
};
