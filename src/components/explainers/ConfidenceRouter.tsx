import { useMemo, useState } from 'react';
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
	/** Why it was wrong, shown when the reader selects it. */
	note?: string;
};

type Props = {
	decisions?: Decision[];
	/** Plural noun for one decision's subject: "search terms", "invoice lines". */
	unit?: string;
	/** Monthly volume used to scale the sample up in the verdict. */
	volume?: number;
	/** Starting thresholds. */
	act?: number;
	review?: number;
	heading?: string;
	caption?: string;
};

// Illustrative: search-term triage for a fictional running-shoe brand, "Northfield".
// Mostly right when very sure, less often right when unsure — the pattern a well-calibrated model should show.
const DEFAULT: Decision[] = [
	{ label: 'northfield running shoes', answer: 'Branded', confidence: 0.995, correct: true },
	{ label: 'northfield trail runner review', answer: 'Branded', confidence: 0.99, correct: true },
	{ label: 'northfield store near me', answer: 'Branded', confidence: 0.985, correct: true },
	{ label: 'best running shoes 2026', answer: 'Generic', confidence: 0.98, correct: true },
	{ label: 'running shoes for flat feet', answer: 'Generic', confidence: 0.975, correct: true },
	{ label: 'free shoe coupon printable', answer: 'Irrelevant', confidence: 0.97, correct: true },
	{ label: 'marathon training plan pdf', answer: 'Irrelevant', confidence: 0.965, correct: true },
	{ label: 'stridewell vs northfield', answer: 'Competitor', confidence: 0.96, correct: true },
	{ label: 'northface running jacket', answer: 'Branded', confidence: 0.955, correct: false, note: 'A different brand with a similar name. Confident and wrong: the costliest kind of mistake.' },
	{ label: 'stridewell sale', answer: 'Competitor', confidence: 0.952, correct: true },
	{ label: 'north field shoes', answer: 'Branded', confidence: 0.95, correct: true },
	{ label: 'trail shoes waterproof', answer: 'Generic', confidence: 0.93, correct: true },
	{ label: 'northfield returns policy', answer: 'Branded', confidence: 0.92, correct: true },
	{ label: 'shoe stretcher', answer: 'Irrelevant', confidence: 0.9, correct: true },
	{ label: 'cheap running shoes', answer: 'Generic', confidence: 0.88, correct: true },
	{ label: 'nf ultra 3', answer: 'Branded', confidence: 0.86, correct: true },
	{ label: 'stride running club', answer: 'Competitor', confidence: 0.84, correct: false, note: 'A local running club, not the competitor brand. Should be irrelevant.' },
	{ label: 'northfield jobs', answer: 'Branded', confidence: 0.82, correct: false, note: 'Has the brand name, but it’s a job seeker, not a customer. Should be irrelevant.' },
	{ label: 'running shoe best cushioning', answer: 'Generic', confidence: 0.8, correct: true },
	{ label: 'ultra 3 vs pegasus', answer: 'Competitor', confidence: 0.76, correct: true },
	{ label: 'field running shoes kids', answer: 'Branded', confidence: 0.72, correct: false, note: '“Field” isn’t the brand. Should be generic.' },
	{ label: 'northfield ma running store', answer: 'Branded', confidence: 0.68, correct: false, note: 'A store in Northfield, Massachusetts. Should be irrelevant.' },
	{ label: 'zero drop shoes', answer: 'Generic', confidence: 0.64, correct: true },
	{ label: 'run shoes', answer: 'Generic', confidence: 0.6, correct: true },
	{ label: 'north running', answer: 'Branded', confidence: 0.56, correct: false, note: 'Too vague to call. Should be generic.' },
	{ label: 'stridewell outlet northfield', answer: 'Competitor', confidence: 0.52, correct: true },
];

const MIN = 0.5;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Drag two confidence thresholds and see which decisions a system makes alone, which a person approves, and which a person decides. */
export default function ConfidenceRouter({
	decisions = DEFAULT,
	unit = 'search terms',
	volume = 100_000,
	act: act0 = 0.95,
	review: review0 = 0.7,
	heading = 'Where would you draw the lines?',
	caption = 'Illustrative · search-term triage for a fictional brand',
}: Props) {
	const [act, setAct] = useState(act0);
	const [review, setReview] = useState(review0);
	const [sel, setSel] = useState<number | null>(null);

	const lane = (c: number) => (c >= act ? 'acts' : c >= review ? 'approves' : 'decides');
	const counts = useMemo(() => {
		const r = { acts: 0, approves: 0, decides: 0, slipped: 0, caught: 0 };
		for (const d of decisions) {
			const l = lane(d.confidence);
			r[l]++;
			if (!d.correct) l === 'acts' ? r.slipped++ : r.caught++;
		}
		return r;
	}, [decisions, act, review]);

	// Strip plot: x = confidence, dots stacked upward where they'd overlap.
	const W = 560, H = 170, L = 12, R = 12, base = 118, gap = 15;
	const X = (c: number) => L + ((c - MIN) / (1 - MIN)) * (W - L - R);
	const placed = useMemo(() => {
		const rows: number[][] = [];
		return decisions.map((d) => {
			const x = X(d.confidence);
			let row = 0;
			while (rows[row]?.some((px) => Math.abs(px - x) < 13)) row++;
			(rows[row] ??= []).push(x);
			return { x, y: base - row * gap };
		});
	}, [decisions]);

	const n = decisions.length;
	const scale = volume / n;
	const d = sel === null ? null : decisions[sel];

	const setActSafe = (v: number) => { setAct(v); if (review > v - 0.01) setReview(Math.max(MIN, +(v - 0.01).toFixed(2))); };
	const setReviewSafe = (v: number) => setReview(Math.min(v, +(act - 0.01).toFixed(2)));

	return (
		<div className="lab router">
			<div className="lab-h"><b>Try it</b><span>{caption}</span></div>
			<h4>{heading}</h4>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n} decisions plotted by the model's confidence, split into three zones by your thresholds`}>
				<rect x={X(act)} y={8} width={X(1) - X(act)} height={base - 2} fill="var(--mark)" opacity={0.8} />
				<rect x={X(review)} y={8} width={X(act) - X(review)} height={base - 2} fill="var(--s1)" />
				{[
					{ label: 'Person decides', from: MIN, to: review },
					{ label: 'Person approves', from: review, to: act },
					{ label: 'Auto', from: act, to: 1 },
				].map((z) => X(z.to) - X(z.from) > z.label.length * 6.2 && (
					<text key={z.label} x={(X(z.from) + X(z.to)) / 2} y={24} textAnchor="middle" className="zone">{z.label}</text>
				))}
				<line x1={L} x2={W - R} y1={base + 12} y2={base + 12} stroke="var(--s2)" strokeWidth={1.5} />
				{[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
					<text key={t} x={X(t)} y={H - 16} textAnchor={t === 0.5 ? 'start' : t === 1 ? 'end' : 'middle'}>{pct(t)}</text>
				))}
				<text x={X(0.75)} y={H - 2} textAnchor="middle">Model’s confidence →</text>
				{[act, review].map((t, i) => (
					<line key={i} x1={X(t)} x2={X(t)} y1={4} y2={base + 12} stroke="var(--fg)" strokeWidth={2} />
				))}
				{decisions.map((dd, i) => {
					const { x, y } = placed[i];
					const on = sel === i;
					const pick = () => setSel(on ? null : i);
					return (
						<g key={dd.label} role="button" tabIndex={0} aria-pressed={on}
							aria-label={`${dd.label}: ${dd.answer}, ${pct(dd.confidence)} sure, ${dd.correct ? 'right' : 'wrong'}`}
							onClick={pick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
							style={{ cursor: 'pointer', outline: 'none' }}>
							<circle cx={x} cy={y} r={on ? 7.5 : 6} fill={dd.correct ? 'var(--fg)' : 'var(--bg)'} stroke="var(--fg)" strokeWidth={on ? 3 : 2} />
							{!dd.correct && <path d={`M${x - 3},${y - 3}L${x + 3},${y + 3}M${x + 3},${y - 3}L${x - 3},${y + 3}`} stroke="var(--fg)" strokeWidth={1.8} />}
						</g>
					);
				})}
			</svg>
			<div className="legend">
				<span><i className="dot" />Right answer</span>
				<span><i className="dot wrong" />Wrong answer</span>
				<span>Select a dot to see the {unit.replace(/s$/, '')}</span>
			</div>

			<div className="split">
				<label htmlFor="rt-act"><span>Act automatically when the model is at least this sure</span><output>{pct(act)}</output></label>
				<input id="rt-act" type="range" min={0.75} max={0.99} step={0.01} value={act} onChange={(e) => setActSafe(+e.target.value)} />
				<label htmlFor="rt-review"><span>A person decides when the model is less than this sure</span><output>{pct(review)}</output></label>
				<input id="rt-review" type="range" min={MIN} max={0.94} step={0.01} value={review} onChange={(e) => setReviewSafe(+e.target.value)} />
			</div>

			<div className="calc lanes">
				<div className="cell auto"><small>Automatic, logged</small><span className="big">{counts.acts}</span><small>of {n} · no one touches these</small></div>
				<div className="cell"><small>Prepared, person approves</small><span className="big">{counts.approves}</span><small>quick yes or no</small></div>
				<div className="cell"><small>Person decides</small><span className="big">{counts.decides}</span><small>full human judgment</small></div>
			</div>

			{d && (
				<div className="pick">
					<b>“{d.label}”</b> → {d.answer}, {pct(d.confidence)} sure. <em>{lane(d.confidence) === 'acts' ? 'Goes live automatically.' : lane(d.confidence) === 'approves' ? 'A person approves it.' : 'A person decides.'}</em>
					{!d.correct && d.note && <> <span className="wrong-note">Wrong: {d.note}</span></>}
				</div>
			)}

			<div className="verdict" aria-live="polite">
				{counts.slipped === 0
					? <>No wrong answers go live unreviewed, and people handle <b>{counts.approves + counts.decides} of {n}</b>. </>
					: <><b>{counts.slipped} wrong {counts.slipped === 1 ? 'answer goes' : 'answers go'} live</b> with no one looking. People catch the other {counts.caught}. </>}
				At {fmt(volume)} {unit} a month, that’s about <b>{fmt((counts.approves + counts.decides) * scale)} for your team to review</b> and <b>{fmt(counts.slipped * scale)} mistakes nobody reviews</b>. No setting makes both zero. You choose which cost you can live with.
			</div>
		</div>
	);
}
