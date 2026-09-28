import { useState } from 'react';
import './explainers.css';

type Props = {
	/** Real orders in the month (from the store or CRM). */
	actual?: number;
	meta?: number;
	google?: number;
	tiktok?: number;
};

const fmt = (n: number) => n.toLocaleString('en-US');

/** Sliders for each platform's reported conversions vs. the real order count. */
export default function PlatformClaims({ actual = 1000, meta = 620, google = 540, tiktok = 180 }: Props) {
	const [v, setV] = useState({ Meta: meta, Google: google, TikTok: tiktok });
	const sum = v.Meta + v.Google + v.TikTok;
	const max = Math.max(actual * 2, sum);
	const pct = (n: number) => `${(n / max) * 100}%`;
	const over = sum - actual;

	return (
		<div className="lab">
			<div className="lab-h">
				<b>Try it</b>
				<span>{fmt(actual)} real orders · illustrative</span>
			</div>
			<h4>How many sales are your platforms claiming?</h4>
			{(Object.keys(v) as (keyof typeof v)[]).map((k) => (
				<div className="row" key={k}>
					<span>{k}</span>
					<div className="t"><i style={{ width: pct(v[k]) }} /></div>
					<output>{fmt(v[k])}</output>
					<input
						type="range"
						min={0}
						max={actual}
						value={v[k]}
						aria-label={`${k} reported conversions`}
						onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })}
					/>
				</div>
			))}
			<div className="row sum">
				<span>Sum of claims</span>
				<div className="t"><i style={{ width: pct(sum) }} /></div>
				<output>{fmt(sum)}</output>
			</div>
			<div className="row real">
				<span>Actual orders</span>
				<div className="t"><i style={{ width: pct(actual) }} /></div>
				<output>{fmt(actual)}</output>
			</div>
			<div className="verdict" aria-live="polite">
				{over > 0 ? (
					<>Platforms are claiming <b>{fmt(over)} sales that never happened</b>, {Math.round((over / actual) * 100)}% more than exist. Each one is “right” by its own rules.</>
				) : (
					<>Claims add up to {fmt(sum)}, at or below reality. In practice this almost never happens: each platform counts view-throughs, cross-device and overlaps its own way.</>
				)}
			</div>
		</div>
	);
}
