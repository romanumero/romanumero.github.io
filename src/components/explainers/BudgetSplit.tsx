import { useEffect, useMemo, useRef, useState } from 'react';
import './explainers.css';

type Channel = { name: string; a: number; k: number; color: string };
type Props = {
	/** Total monthly budget in $K. */
	budget?: number;
	/** Starting spend on the first channel, in $K. */
	start?: number;
	channels?: [Channel, Channel];
};

// Illustrative saturation curves: revenue = a * (1 - e^(-spend / k)), in $K.
const DEFAULT: [Channel, Channel] = [
	{ name: 'Paid search', a: 420, k: 60, color: 'var(--fg)' },
	{ name: 'Paid social', a: 380, k: 110, color: 'var(--s3)' },
];
const rev = (c: Channel, s: number) => c.a * (1 - Math.exp(-s / c.k));
const marg = (c: Channel, s: number) => (c.a / c.k) * Math.exp(-s / c.k);
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}K`;

/** Split a fixed budget between two channels and watch the marginal returns. */
export default function BudgetSplit({ budget = 200, start = 140, channels = DEFAULT }: Props) {
	const [a, b] = channels;
	const [s, setS] = useState(start);
	const raf = useRef(0);
	useEffect(() => () => cancelAnimationFrame(raf.current), []);

	const best = useMemo(() => {
		let bestS = 0, bestR = 0;
		for (let x = 0; x <= budget; x++) {
			const r = rev(a, x) + rev(b, budget - x);
			if (r > bestR) { bestR = r; bestS = x; }
		}
		return bestS;
	}, [a, b, budget]);

	const W = 520, H = 300, L = 44, R = 12, T = 16, B = 36;
	const maxR = Math.ceil(Math.max(a.a, b.a) / 100) * 100 + 20;
	const X = (x: number) => L + (x / budget) * (W - L - R);
	const Y = (r: number) => H - B - (r / maxR) * (H - T - B);
	const path = (c: Channel) => {
		let d = '';
		for (let x = 0; x <= budget; x += budget / 100) d += `${d ? 'L' : 'M'}${X(x).toFixed(1)},${Y(rev(c, x)).toFixed(1)}`;
		return d;
	};

	const o = budget - s;
	const total = rev(a, s) + rev(b, o);
	const baseline = rev(a, start) + rev(b, budget - start);
	const ma = marg(a, s), mb = marg(b, o);
	const atBest = Math.abs(s - best) <= Math.max(2, budget / 100);

	function optimize() {
		const from = s, t0 = performance.now();
		const step = (t: number) => {
			const p = Math.min(1, (t - t0) / 900), e = 1 - (1 - p) ** 3;
			setS(Math.round(from + (best - from) * e));
			if (p < 1) raf.current = requestAnimationFrame(step);
		};
		raf.current = requestAnimationFrame(step);
	}

	const ticks = [1, 2, 3, 4].map((i) => (i * maxR) / 4).map((r) => Math.round(r / 50) * 50);

	return (
		<div className="lab">
			<div className="lab-h">
				<b>Try it</b>
				<span>{money(budget)} monthly budget · illustrative response curves</span>
			</div>
			<h4>Where should the next dollar go?</h4>
			<div className="curve">
				<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Response curves for ${a.name} and ${b.name}`}>
					<line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--s2)" />
					{ticks.map((r) => (
						<g key={r}>
							<line x1={L} x2={W - R} y1={Y(r)} y2={Y(r)} stroke="var(--s1)" />
							<text x={L - 6} y={Y(r) + 4} textAnchor="end">${r}K</text>
						</g>
					))}
					<text x={L} y={H - 12}>$0</text>
					<text x={W - R} y={H - 12} textAnchor="end">{money(budget)} spend</text>
					<path d={path(a)} fill="none" stroke={a.color} strokeWidth={3} />
					<path d={path(b)} fill="none" stroke={b.color} strokeWidth={3} strokeDasharray="8 5" />
					<text x={W - R} y={Y(rev(a, budget)) - 8} textAnchor="end" style={{ fill: a.color, fontWeight: 600 }}>{a.name}</text>
					<text x={W - R} y={Y(rev(b, budget)) + 18} textAnchor="end" style={{ fill: b.color, fontWeight: 600 }}>{b.name}</text>
					{[[a, s], [b, o]].map(([c, x]) => (
						<g key={(c as Channel).name}>
							<line x1={X(x as number)} x2={X(x as number)} y1={Y(rev(c as Channel, x as number))} y2={H - B} stroke={(c as Channel).color} strokeDasharray="3 4" />
							<circle cx={X(x as number)} cy={Y(rev(c as Channel, x as number))} r={7} fill="var(--acc)" stroke="var(--fg)" strokeWidth={2} />
						</g>
					))}
				</svg>
				<div>
					<div className="stat"><small>Incremental revenue from this split</small><b>{money(total)}</b></div>
					<div className="stat"><small>Next $1 in {a.name.toLowerCase()} returns</small><b>${ma.toFixed(2)}</b></div>
					<div className="stat"><small>Next $1 in {b.name.toLowerCase()} returns</small><b>${mb.toFixed(2)}</b></div>
				</div>
			</div>
			<div className="split">
				<label htmlFor="budget-split">
					<span>{a.name} <b>{money(s)}</b></span>
					<span>{b.name} <b>{money(o)}</b></span>
				</label>
				<input id="budget-split" type="range" min={0} max={budget} step={1} value={s} onChange={(e) => setS(Number(e.target.value))} />
				<button className="ghost" onClick={optimize}>Find the best split</button>
			</div>
			<div className="verdict" aria-live="polite">
				{atBest ? (
					<><b>That’s the sweet spot.</b> The next dollar earns about the same in both channels. Same budget, {total >= baseline ? '+' : ''}{money(total - baseline)} vs. the starting plan.</>
				) : ma < mb ? (
					<>{a.name} is flattening: its next dollar returns ${ma.toFixed(2)}, while {b.name.toLowerCase()} returns ${mb.toFixed(2)}. <b>Move budget toward {b.name.toLowerCase()}</b>, even if {a.name.toLowerCase()} has the higher <em>average</em> ROAS.</>
				) : (
					<>Now {b.name.toLowerCase()} is saturating. <b>Move some budget back to {a.name.toLowerCase()}.</b></>
				)}
			</div>
		</div>
	);
}
