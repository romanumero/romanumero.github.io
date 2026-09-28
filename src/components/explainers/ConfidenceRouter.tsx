import { useMemo, useState, type ReactNode } from 'react';
import './explainers.css';

export type Decision = {
	/** What the model looked at, e.g. a search term. */
	label: string;
	/** The answer the model picked. */
	answer: string;
	/** How sure the model says it is, 0–1. */
	confidence: number;
	/** Whether that answer was right. */
	correct: boolean;
};

type Props = {
	decisions?: Decision[];
	/** Starting threshold: at or above it, the system acts alone. */
	threshold?: number;
	heading?: string;
	caption?: string;
	/** What one wrong automatic answer costs in this example. */
	mistake?: ReactNode;
};

const d = (label: string, answer: string, confidence: number, correct = true): Decision => ({ label, answer, confidence, correct });

// Illustrative: search-term triage for a fictional running-shoe brand, "Northfield" (competitor: "Stridewell").
// Shaped like a well-calibrated model: nearly always right when very sure, mistakes clustered where it's unsure.
const DEFAULT: Decision[] = [
	d('northfield running shoes', 'Branded', 0.99), d('northfield shoes', 'Branded', 0.99),
	d('northfield trail runner', 'Branded', 0.99), d('northfield ultra 3', 'Branded', 0.99),
	d('northfield store', 'Branded', 0.99), d('northfield.com', 'Branded', 0.99),
	d('buy northfield shoes', 'Branded', 0.99), d('northfield sale', 'Branded', 0.99),
	d('best running shoes 2026', 'Generic', 0.98), d('running shoes for flat feet', 'Generic', 0.98),
	d('womens running shoes', 'Generic', 0.98), d('trail running shoes', 'Generic', 0.98),
	d('stridewell shoes', 'Competitor', 0.98), d('stridewell sale', 'Competitor', 0.98),
	d('shoe laces replacement', 'Irrelevant', 0.98), d('how to tie running shoes', 'Irrelevant', 0.98),
	d('marathon training plan pdf', 'Irrelevant', 0.97), d('free shoe coupon printable', 'Irrelevant', 0.97),
	d('stridewell vs northfield', 'Competitor', 0.97), d('northfield promo code', 'Branded', 0.97),
	d('northfield reviews', 'Branded', 0.97), d('wide running shoes', 'Generic', 0.97),
	d('running shoes men', 'Generic', 0.97),
	d('stridewell outlet', 'Competitor', 0.96), d('northfield near me', 'Branded', 0.96),
	d('cushioned running shoes', 'Generic', 0.96), d('shoe size chart', 'Irrelevant', 0.96),
	d('running socks', 'Irrelevant', 0.96), d('northfield return policy', 'Branded', 0.96),
	d('stridewell glide 5', 'Competitor', 0.96),
	d('north field shoes', 'Branded', 0.95), d('northfield ultra 3 review', 'Branded', 0.95),
	d('stability running shoes', 'Generic', 0.95), d('running shoes on sale', 'Generic', 0.95),
	d('northface running jacket', 'Branded', 0.955, false), d('stridewell warranty', 'Competitor', 0.95),
	d('trail shoes waterproof', 'Generic', 0.93), d('cheap running shoes', 'Generic', 0.92),
	d('nf ultra 3', 'Branded', 0.91), d('shoe stretcher', 'Irrelevant', 0.9),
	d('running shoes plantar fasciitis', 'Generic', 0.89), d('stridewell kids', 'Competitor', 0.88),
	d('lightweight trainers', 'Generic', 0.87), d('northfield gift card', 'Branded', 0.86),
	d('stride running club', 'Competitor', 0.84, false), d('running store', 'Generic', 0.83),
	d('northfield jobs', 'Branded', 0.82, false), d('running shoe best cushioning', 'Generic', 0.8),
	d('ultra 3 vs stridewell glide', 'Competitor', 0.78), d('zero drop shoes', 'Generic', 0.76),
	d('field running shoes kids', 'Branded', 0.74, false), d('north trail shoes', 'Generic', 0.72),
	d('northfield ma running store', 'Branded', 0.68, false), d('run shoes', 'Generic', 0.66),
	d('stride shoes', 'Competitor', 0.63), d('nf shoes', 'Branded', 0.61), d('field shoes', 'Generic', 0.58),
	d('north running', 'Branded', 0.56, false), d('stridewell outlet northfield', 'Competitor', 0.54),
	d('ultra shoes', 'Generic', 0.52),
];

const MIN = 0.5;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const bin = (c: number) => Math.min(99, Math.floor(c * 100 + 1e-9));

/** One slider: how sure must the model be before it acts without a person checking? */
export default function ConfidenceRouter({
	decisions = DEFAULT,
	threshold = 0.95,
	heading = 'How sure before it acts on its own?',
	caption = 'Illustrative · search-term triage for a fictional brand',
	mistake = <>Here a mistake is a mislabeled search term: cheap and easy to undo. For budget changes, you’d set the line much higher.</>,
}: Props) {
	const [t, setT] = useState(threshold);
	const n = decisions.length;
	const { auto, slipped } = useMemo(() => {
		let auto = 0, slipped = 0;
		for (const x of decisions) if (x.confidence >= t) { auto++; if (!x.correct) slipped++; }
		return { auto, slipped };
	}, [decisions, t]);
	const perThousand = Math.round((slipped / n) * 1000);

	// Dot histogram: one column per percentage point of confidence, dots stacked upward.
	const stacks = useMemo(() => {
		const h: Record<number, number> = {};
		return decisions.map((x) => { const b = bin(x.confidence); h[b] = (h[b] ?? 0) + 1; return { b, row: h[b] - 1 }; });
	}, [decisions]);
	const tallest = Math.max(1, ...stacks.map((s) => s.row + 1));
	const W = 560, L = 12, R = 12, gap = 10.5, top = 34;
	const base = top + tallest * gap;
	const H = base + 42;
	const X = (c: number) => L + ((c - MIN) / (1 - MIN)) * (W - L - R);

	return (
		<div className="lab router">
			<div className="lab-h"><b>Try it</b><span>{caption}</span></div>
			<h4>{heading}</h4>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n} decisions by the model's confidence. ${auto} are at or above your line and run automatically; ${slipped} of those are wrong.`}>
				<rect x={X(t)} y={8} width={X(1) - X(t)} height={base - 4} fill="var(--mark)" opacity={0.8} />
				{X(t) - X(MIN) > 90 && <text x={(X(MIN) + X(t)) / 2} y={24} textAnchor="middle" className="zone">A person reviews</text>}
				{X(1) - X(t) > 28 && <text x={(X(t) + X(1)) / 2} y={24} textAnchor="middle" className="zone">Auto</text>}
				<line x1={L} x2={W - R} y1={base + 4} y2={base + 4} stroke="var(--s2)" strokeWidth={1.5} />
				{[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => (
					<text key={v} x={X(v)} y={H - 18} textAnchor={v === 0.5 ? 'start' : v === 1 ? 'end' : 'middle'}>{pct(v)}</text>
				))}
				<text x={X(0.75)} y={H - 3} textAnchor="middle">Model’s confidence →</text>
				<line x1={X(t)} x2={X(t)} y1={4} y2={base + 4} stroke="var(--fg)" strokeWidth={2} />
				{decisions.map((x, i) => {
					const cx = X((stacks[i].b + 0.5) / 100), cy = base - 4 - stacks[i].row * gap;
					return (
						<g key={x.label}>
							<circle cx={cx} cy={cy} r={4.4} fill={x.correct ? 'var(--fg)' : 'var(--bg)'} stroke="var(--fg)" strokeWidth={1.6} />
							{!x.correct && <path d={`M${cx - 2.2},${cy - 2.2}L${cx + 2.2},${cy + 2.2}M${cx + 2.2},${cy - 2.2}L${cx - 2.2},${cy + 2.2}`} stroke="var(--fg)" strokeWidth={1.4} />}
						</g>
					);
				})}
			</svg>
			<div className="legend">
				<span><i className="dot" />Right answer</span>
				<span><i className="dot wrong" />Wrong answer</span>
			</div>

			<div className="split">
				<label htmlFor="rt-t"><span>Act on its own when the model is at least this sure</span><output>{pct(t)}</output></label>
				<input id="rt-t" type="range" min={0.6} max={0.99} step={0.01} value={t} onChange={(e) => setT(+e.target.value)} />
			</div>

			<div className="calc lanes">
				<div className="cell auto"><small>Work your team no longer reviews</small><span className="big">{pct(auto / n)}</span></div>
				<div className="cell"><small>Mistakes that go live, per 1,000</small><span className="big">{perThousand}</span></div>
			</div>

			<div className="verdict" aria-live="polite">
				<p>
					{slipped === 0
						? <>At this line, nothing wrong gets through, but your team still reviews {pct(1 - auto / n)} of the work.</>
						: <>Lower the line and your team does less, but more mistakes reach the account unchecked. There’s no setting where both are zero.</>}
				</p>
				{mistake && <p className="aside">{mistake}</p>}
			</div>
		</div>
	);
}
