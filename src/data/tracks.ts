// The eight roadmap tracks, named by the problem an agency owner has, not the discipline.
export const TRACKS = [
	{ id: 'ai', label: 'AI', question: 'Where does AI actually help us?' },
	{ id: 'evals', label: 'Evals', question: 'Is our AI getting it right?' },
	{ id: 'automation', label: 'Automation', question: 'What should no human do anymore?' },
	{ id: 'analytics', label: 'Analytics', question: 'Which numbers can we trust?' },
	{ id: 'mmm', label: 'MMM', question: 'Where should the budget go?' },
	{ id: 'incrementality', label: 'Incrementality', question: 'Did the media cause the sale?' },
	{ id: 'process', label: 'Process', question: 'How do we build the agency around it?' },
	{ id: 'leadership', label: 'Leadership', question: 'How do I lead a team through this?' },
] as const;

export type TrackId = (typeof TRACKS)[number]['id'];
export const TRACK_IDS = TRACKS.map((t) => t.id) as [TrackId, ...TrackId[]];
export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id)!;
