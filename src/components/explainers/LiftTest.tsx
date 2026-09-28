import { useEffect, useRef, useState } from 'react';
import './explainers.css';

// Illustrative weekly revenue, indexed to 100. Media turns on in test markets at week 8.
const CONTROL = [92, 97, 99, 106, 105, 101, 95, 90, 90, 86, 81, 84, 88, 90];
const TEST = [91, 96, 101, 106, 101, 99, 95, 97, 108, 102, 103, 105, 102, 108];
const START = 7; // index of first test week

export default function LiftTest() {
	const [p, setP] = useState(0); // 0 = pre-period only, 1 = full test shown
	const raf = useRef(0);
	useEffect(() => () => cancelAnimationFrame(raf.current), []);

	const run = () => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce || document.hidden) return setP(1);
		const t0 = performance.now();
		const step = (t: number) => {
			const k = Math.min(1, (t - t0) / 1800);
			setP(k);
			if (k < 1) raf.current = requestAnimationFrame(step);
		};
		setP(0);
		raf.current = requestAnimationFrame(step);
	};

	const W = 560, H = 260, L = 16, R = 16, T = 20, B = 30;
	const n = CONTROL.length;
	const X = (i: number) => L + (i / (n - 1)) * (W - L - R);
	const Y = (v: number) => T + ((112 - v) / 36) * (H - T - B);
	const shown = START - 1 + p * (n - START); // fractional last index shown
	const pts = (arr: number[]) => {
		const out: string[] = [];
		for (let i = 0; i <= Math.floor(shown); i++) out.push(`${X(i)},${Y(arr[i])}`);
		const f = shown - Math.floor(shown), i = Math.floor(shown);
		if (f > 0 && i + 1 < n) out.push(`${X(i + f)},${Y(arr[i] + (arr[i + 1] - arr[i]) * f)}`);
		return out.join(' ');
	};
	// gap area between the lines during the test period
	const gap = () => {
		if (shown <= START - 1) return '';
		const top: string[] = [], bot: string[] = [];
		for (let i = START - 1; i <= Math.floor(shown); i++) { top.push(`${X(i)},${Y(TEST[i])}`); bot.unshift(`${X(i)},${Y(CONTROL[i])}`); }
		return [...top, ...bot].join(' ');
	};
	const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
	const lift = (avg(TEST.slice(START)) - avg(CONTROL.slice(START))) / avg(CONTROL.slice(START));

	return (
		<div className="lab">
			<div className="lab-h"><b>Try it</b><span>Illustrative · weekly revenue indexed to 100</span></div>
			<h4>Turn the media on and watch the gap open.</h4>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Test markets versus control markets, before and during the test">
				<rect x={X(START - 0.5)} y={T - 8} width={X(n - 1) - X(START - 0.5) + 8} height={H - T - B + 8} fill="var(--s1)" opacity={p > 0 ? 1 : 0.5} />
				<text x={X(0)} y={H - 8}>Before: matched markets move together</text>
				<text x={X(START - 0.3)} y={H - 8}>Test period: media on in test markets</text>
				{p > 0 && <polygon points={gap()} fill="var(--acc)" opacity={0.55} />}
				<polyline points={pts(CONTROL)} fill="none" stroke="var(--s3)" strokeWidth={3} strokeLinejoin="round" />
				<polyline points={pts(TEST)} fill="none" stroke="var(--fg)" strokeWidth={3} strokeLinejoin="round" />
			</svg>
			<div className="controls">
				<button className="btn-sm" onClick={run}>{p === 0 ? 'Turn media on' : 'Run it again'}</button>
				<div className="legend">
					<span><i style={{ background: 'var(--fg)' }} />Test markets (media on)</span>
					<span><i style={{ background: 'var(--s3)' }} />Control markets (held out)</span>
					<span><i style={{ background: 'var(--acc)', height: 10 }} />Incremental revenue</span>
				</div>
			</div>
			<div className="verdict" aria-live="polite">
				{p < 1
					? <>Before the test, test and control markets track each other. That’s what makes the comparison fair.</>
					: <>The highlighted gap is the <b>incremental revenue</b>: sales that would not have happened without the ads. Here it’s a <b>{Math.round(lift * 100)}% lift</b>.</>}
			</div>
		</div>
	);
}
