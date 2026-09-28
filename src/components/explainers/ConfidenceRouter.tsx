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
	/** How the work gets done today, for comparison. */
	today?: ReactNode;
	/** What one wrong automatic answer costs in this example. */
	mistake?: ReactNode;
};

const d = (label: string, answer: string, confidence: number, note?: string): Decision =>
	({ label, answer, confidence, correct: !note, note });

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
	d('northface running jacket', 'Branded', 0.955, 'A different brand with a similar name. Confident and wrong: the mistake that goes live if no one checks.'),
	d('stridewell warranty', 'Competitor', 0.95),
	d('trail shoes waterproof', 'Generic', 0.93), d('cheap running shoes', 'Generic', 0.92),
	d('nf ultra 3', 'Branded', 0.91), d('shoe stretcher', 'Irrelevant', 0.9),
	d('running shoes plantar fasciitis', 'Generic', 0.89), d('stridewell kids', 'Competitor', 0.88),
	d('lightweight trainers', 'Generic', 0.87), d('northfield gift card', 'Branded', 0.86),
	d('stride running club', 'Competitor', 0.84, 'A local running club, not the competitor brand. Should be irrelevant.'),
	d('running store', 'Generic', 0.83),
	d('northfield jobs', 'Branded', 0.82, 'Has the brand name, but it’s a job seeker, not a customer. Should be irrelevant.'),
	d('running shoe best cushioning', 'Generic', 0.8), d('ultra 3 vs stridewell glide', 'Competitor', 0.78),
	d('zero drop shoes', 'Generic', 0.76),
	d('field running shoes kids', 'Branded', 0.74, '“Field” isn’t the brand. Should be generic.'),
	d('north trail shoes', 'Generic', 0.72),
	d('northfield ma running store', 'Branded', 0.68, 'A store in Northfield, Massachusetts. Should be irrelevant.'),
	d('run shoes', 'Generic', 0.66), d('stride shoes', 'Competitor', 0.63), d('nf shoes', 'Branded', 0.61),
	d('field shoes', 'Generic', 0.58),
	d('north running', 'Branded', 0.56, 'Too vague to call. Should be generic.'),
	d('stridewell outlet northfield', 'Competitor', 0.54), d('ultra shoes', 'Generic', 0.52),
];

const MIN = 0.5;
const pct = (n: number) => `${Math.round(n * 100)}%`;
/** Round to a believable precision: the sample can't support more. */
const about = (n: number) => {
	const step = n >= 10_000 ? 1_000 : n >= 1_000 ? 100 : 10;
	return (Math.round(n / step) * step).toLocaleString('en-US');
};
const bin = (c: number) => Math.min(99, Math.floor(c * 100 + 1e-9));

/** Drag two confidence thresholds and see which decisions run automatically, which a person approves, and which a person decides. */
export default function ConfidenceRouter({
	decisions = DEFAULT,
	unit = 'search terms',
	volume = 100_000,
	act: act0 = 0.95,
	review: review0 = 0.7,
	heading = 'Where would you draw the lines?',
	caption = 'Illustrative · search-term triage for a fictional brand',
	today = <>Checking every term by hand would be 100,000 reviews a month, so most teams check the top spenders and never see the rest.</>,
	mistake = <>A mislabeled search term is cheap and easy to undo: a few wasted clicks until someone adds a negative keyword. For something like budget changes, you’d set the line much higher.</>,
}: Props) {
	const [act, setAct] = useState(act0);
	const [review, setReview] = useState(review0);
	const [sel, setSel] = useState<number | null>(null);

	const lane = (c: number) => (c >= act ? 'acts' : c >= review ? 'approves' : 'decides');
	const counts = useMemo(() => {
		const r = { acts: 0, approves: 0, decides: 0, slipped: 0, caught: 0 };
		for (const x of decisions) {
			const l = lane(x.confidence);
			r[l]++;
			if (!x.correct) l === 'acts' ? r.slipped++ : r.caught++;
		}
		return r;
	}, [decisions, act, review]);

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

	const n = decisions.length;
	const scale = volume / n;
	const picked = sel === null ? null : decisions[sel];

	const setActSafe = (v: number) => { setAct(v); if (review > v - 0.01) setReview(Math.max(MIN, +(v - 0.01).toFixed(2))); };
	const setReviewSafe = (v: number) => setReview(Math.min(v, +(act - 0.01).toFixed(2)));

	return (
		<div className="lab router">
			<div className="lab-h"><b>Try it</b><span>{caption}</span></div>
			<h4>{heading}</h4>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n} decisions plotted by the model's confidence, split into three zones by your thresholds`}>
				<rect x={X(act)} y={8} width={X(1) - X(act)} height={base - 4} fill="var(--mark)" opacity={0.8} />
				<rect x={X(review)} y={8} width={X(act) - X(review)} height={base - 4} fill="var(--s1)" />
				{[
					{ label: 'Person decides', from: MIN, to: review },
					{ label: 'Person approves', from: review, to: act },
					{ label: 'Auto', from: act, to: 1 },
				].map((z) => X(z.to) - X(z.from) > z.label.length * 6.2 && (
					<text key={z.label} x={(X(z.from) + X(z.to)) / 2} y={24} textAnchor="middle" className="zone">{z.label}</text>
				))}
				<line x1={L} x2={W - R} y1={base + 4} y2={base + 4} stroke="var(--s2)" strokeWidth={1.5} />
				{[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
					<text key={t} x={X(t)} y={H - 18} textAnchor={t === 0.5 ? 'start' : t === 1 ? 'end' : 'middle'}>{pct(t)}</text>
				))}
				<text x={X(0.75)} y={H - 3} textAnchor="middle">Model’s confidence →</text>
				{[act, review].map((t, i) => (
					<line key={i} x1={X(t)} x2={X(t)} y1={4} y2={base + 4} stroke="var(--fg)" strokeWidth={2} />
				))}
				{decisions.map((x, i) => {
					const cx = X((stacks[i].b + 0.5) / 100), cy = base - 4 - stacks[i].row * gap;
					const on = sel === i;
					const pick = () => setSel(on ? null : i);
					return (
						<g key={x.label} role="button" tabIndex={0} aria-pressed={on}
							aria-label={`${x.label}: ${x.answer}, ${pct(x.confidence)} sure, ${x.correct ? 'right' : 'wrong'}`}
							onClick={pick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
							style={{ cursor: 'pointer', outline: 'none' }}>
							<circle cx={cx} cy={cy} r={on ? 6 : 4.4} fill={x.correct ? 'var(--fg)' : 'var(--bg)'} stroke="var(--fg)" strokeWidth={on ? 2.5 : 1.6} />
							{!x.correct && <path d={`M${cx - 2.2},${cy - 2.2}L${cx + 2.2},${cy + 2.2}M${cx + 2.2},${cy - 2.2}L${cx - 2.2},${cy + 2.2}`} stroke="var(--fg)" strokeWidth={1.4} />}
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
				<div className="cell auto"><small>Automatic, logged</small><span className="big">{pct(counts.acts / n)}</span><small>{counts.acts} of {n} · no one touches these</small></div>
				<div className="cell"><small>Prepared, person approves</small><span className="big">{pct(counts.approves / n)}</span><small>{counts.approves} of {n} · quick yes or no</small></div>
				<div className="cell"><small>Person decides</small><span className="big">{pct(counts.decides / n)}</span><small>{counts.decides} of {n} · full human judgment</small></div>
			</div>

			{picked && (
				<div className="pick">
					<b>“{picked.label}”</b> → {picked.answer}, {pct(picked.confidence)} sure. <em>{lane(picked.confidence) === 'acts' ? 'Goes live automatically.' : lane(picked.confidence) === 'approves' ? 'A person approves it.' : 'A person decides.'}</em>
					{!picked.correct && picked.note && <> <span className="wrong-note">Wrong: {picked.note}</span></>}
				</div>
			)}

			<div className="verdict" aria-live="polite">
				<p>
					{counts.acts === 0
						? <>Nothing runs automatically. People handle every {unit.replace(/s$/, '')}.</>
						: counts.slipped === 0
							? <>None of the {counts.acts} automatic answers in this sample are wrong.</>
							: <><b>About 1 in {Math.round(counts.acts / counts.slipped)} automatic answers is wrong</b> and goes live with no one looking.</>}
					{counts.caught > 0 && <> People catch the other {counts.caught} mistakes before they go live.</>}
				</p>
				<p>
					At {volume.toLocaleString('en-US')} {unit} a month: about <b>{about(counts.approves * scale)} quick approvals</b>, <b>{about(counts.decides * scale)} full decisions</b>, and <b>{about(counts.slipped * scale)} mistakes nobody reviews</b>.
				</p>
				{today && <p className="aside"><b>Compared with today:</b> {today}</p>}
				{mistake && <p className="aside"><b>What a mistake costs here:</b> {mistake}</p>}
			</div>
		</div>
	);
}
