import { useState } from 'react';
import './explainers.css';

/** Turn a geo-test result into a factor you can apply to daily platform reporting. */
export default function IncrementalityFactor({ roas = 4, iroas = 2 }: { roas?: number; iroas?: number }) {
	const [r, setR] = useState(roas);
	const [i, setI] = useState(iroas);
	const [today, setToday] = useState(3.6);
	const factor = r > 0 ? i / r : 0;
	const f1 = (n: number) => n.toFixed(1);

	return (
		<div className="lab">
			<div className="lab-h"><b>Try it</b><span>Illustrative figures</span></div>
			<h4>Turn platform numbers into real value.</h4>
			<div className="calc">
				<div className="cell">
					<small>Platform-reported ROAS</small>
					<span className="big">{f1(r)}x</span>
					<input type="range" min={0.5} max={8} step={0.1} value={r} onChange={(e) => setR(Number(e.target.value))} aria-label="Platform-reported ROAS" />
				</div>
				<div className="cell">
					<small>Incremental ROAS from a geo test</small>
					<span className="big">{f1(i)}x</span>
					<input type="range" min={0.1} max={8} step={0.1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="Incremental ROAS from the test" />
				</div>
				<div className="cell dark">
					<small>Incrementality factor for daily reporting</small>
					<span className="big">{factor.toFixed(2)}</span>
					<small>= {f1(i)} ÷ {f1(r)}</small>
				</div>
			</div>
			<div className="split">
				<label htmlFor="today-roas"><span>This week the platform reports <b>{f1(today)}x</b></span><span>Really about <b>{(today * factor).toFixed(1)}x</b></span></label>
				<input id="today-roas" type="range" min={0.5} max={8} step={0.1} value={today} onChange={(e) => setToday(Number(e.target.value))} />
			</div>
			<div className="formula">
				<span><b>iROAS</b> = incremental revenue ÷ media spend in the test</span>
				<span><b>Lift %</b> = (test − control) ÷ control</span>
			</div>
			<div className="verdict" aria-live="polite">
				{factor < 1
					? <>For every $1 the platform takes credit for, about <b>${factor.toFixed(2)}</b> was actually caused by the ads. Apply the factor daily; re-test to update it.</>
					: <>The test found <b>more</b> value than the platform reports. It happens, usually for upper-funnel video and CTV that last-click undercounts.</>}
			</div>
		</div>
	);
}
