import { useState } from 'react';
import './explainers.css';

type Est = [number, number, number]; // estimate, low, high (incremental ROAS)
const CHANNELS: { name: string; mmm: Est; cal: Est }[] = [
	{ name: 'Paid search', mmm: [3.1, 2.2, 4.0], cal: [2.4, 2.0, 2.8] },
	{ name: 'Paid social', mmm: [2.6, 0.8, 4.4], cal: [2.1, 1.7, 2.5] },
	{ name: 'CTV / video', mmm: [1.8, 0.3, 3.6], cal: [1.4, 1.0, 1.9] },
];
const MAX = 5;
const pct = (v: number) => `${(v / MAX) * 100}%`;
const fmt = ([e, lo, hi]: Est) => `${e.toFixed(1)}x (${lo.toFixed(1)}–${hi.toFixed(1)})`;

export default function CalibrationRanges() {
	const [on, setOn] = useState(false);
	return (
		<div className="lab">
			<div className="lab-h"><b>Try it</b><span>Illustrative · dot = best estimate, bar = likely range</span></div>
			<h4>Experiments narrow the range of answers.</h4>
			<button className="switch" aria-pressed={on} onClick={() => setOn(!on)}>
				<span className="knob" aria-hidden="true" />
				{on ? 'Calibrated with experiments' : 'MMM alone'}
			</button>
			<div className={`ranges ${on ? 'calibrated' : ''}`}>
				{CHANNELS.map((c) => {
					const [e, lo, hi] = on ? c.cal : c.mmm;
					return (
						<div className="rg" key={c.name}>
							<b>{c.name}</b>
							<div className="axis" role="img" aria-label={`${c.name}: ${fmt(on ? c.cal : c.mmm)} incremental ROAS`}>
								<span className="band" style={{ left: pct(lo), width: pct(hi - lo) }} />
								<span className="dot" style={{ left: pct(e) }} />
							</div>
							<output>{fmt(on ? c.cal : c.mmm)}</output>
						</div>
					);
				})}
				<div className="ticks"><span /><div>{[0, 1, 2, 3, 4, 5].map((t) => <i key={t} style={{ fontStyle: 'normal' }}>{t}x</i>)}</div><i /></div>
			</div>
			<div className="verdict" aria-live="polite">
				{on
					? <>Paid social went from “somewhere between 0.8x and 4.4x” to <b>1.7x–2.5x</b>. That’s a range you can move budget on.</>
					: <>An MMM alone finds correlations. When channels move together, many answers fit the data equally well, so the ranges are too wide to act on. <b>Flip the switch.</b></>}
			</div>
		</div>
	);
}
