// Parts of the book. `planned` is the number of chapters planned for each part;
// progress is computed from published essays tagged with that part.
export const PARTS = [
	{ n: 1, roman: 'I', title: 'The Shift', blurb: 'What dies, what doesn’t, and why that’s good news', planned: 5 },
	{ n: 2, roman: 'II', title: 'Measuring What Matters', blurb: 'MAGIC, incrementality, MMM', planned: 6 },
	{ n: 3, roman: 'III', title: 'AI That Works', blurb: 'Agents, evals, human-in-the-loop', planned: 6 },
	{ n: 4, roman: 'IV', title: 'The Agency Operating System', blurb: 'Data, workflows, automation', planned: 5 },
	{ n: 5, roman: 'V', title: 'Leading Through It', blurb: 'Teams, pricing, decision rights', planned: 5 },
] as const;
