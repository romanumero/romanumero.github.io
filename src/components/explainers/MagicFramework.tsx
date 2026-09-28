import { useState } from 'react';
import './explainers.css';

// From "Measuring What Matters": trust the evidence closest to profit (priority 1 → 5),
// and match each method to the decision it can actually support.
const LEVELS = [
	{ k: 'M', name: 'Metrics', question: 'Did the business grow profitably?', evidence: 'Revenue, profit, CAC, LTV:CAC', decision: 'Is total marketing paying off?', method: 'Blended MER and CAC', refresh: 'Daily', cause: 'No, but it’s the scoreboard' },
	{ k: 'A', name: 'Analysis', question: 'What did media cause?', evidence: 'Incrementality experiments and controlled tests', decision: 'Did this channel cause sales?', method: 'Incrementality test (geo holdout, lift study)', refresh: '4–10 weeks', cause: 'Yes' },
	{ k: 'G', name: 'Gains', question: 'How should budget be allocated?', evidence: 'Marketing mix modeling and advanced analytics', decision: 'How should we split the budget?', method: 'Marketing mix model, calibrated with tests', refresh: 'Quarterly; checked after every test', cause: 'Partially. Yes once calibrated' },
	{ k: 'I', name: 'Implementation', question: 'Is the data trustworthy?', evidence: 'Tracking, tagging and data collection', decision: 'Which ads did buyers touch?', method: 'Platform attribution on clean, server-side tracking', refresh: 'Real time', cause: 'No' },
	{ k: 'C', name: 'Consumer', question: 'Why did people buy?', evidence: 'Surveys and qualitative insight', decision: 'Why did people buy?', method: 'Post-purchase and customer surveys', refresh: 'Ongoing', cause: 'No, but it explains the why' },
] as const;

export default function MagicFramework() {
	const [sel, setSel] = useState(0);
	const L = LEVELS[sel];
	return (
		<div className="lab">
			<div className="lab-h"><b>Try it</b><span>The MAGIC framework</span></div>
			<h4>What are you trying to decide?</h4>
			<div className="chips" role="group" aria-label="Decisions">
				{LEVELS.map((l, i) => (
					<button key={l.k} className="chip" aria-pressed={i === sel} onClick={() => setSel(i)}>{l.decision}</button>
				))}
			</div>
			<div className="magic">
				<ul className="levels">
					{LEVELS.map((l, i) => (
						<li key={l.k}>
							<button className={i === sel ? 'on' : 'off'} onClick={() => setSel(i)} aria-label={`${l.name}: ${l.question}`}>
								<span className="L">{l.k}</span>
								<span><small>Priority {i + 1}</small><b>{l.name}</b></span>
							</button>
						</li>
					))}
				</ul>
				<div className="card" aria-live="polite">
					<small style={{ font: '500 11px var(--mono)', color: 'var(--s3)' }}>{L.k} · PRIORITY {sel + 1} OF 5</small>
					<h5>{L.question}</h5>
					<p>{L.evidence}</p>
					<dl>
						<dt>Use</dt><dd>{L.method}</dd>
						<dt>Refresh</dt><dd>{L.refresh}</dd>
						<dt>Shows cause?</dt><dd><span className={L.cause.startsWith('Yes') ? 'yes' : undefined}>{L.cause}</span></dd>
					</dl>
				</div>
			</div>
			<div className="verdict">
				{sel === 0
					? <>Start here, always. <b>If the business didn’t grow profitably, no other number matters.</b></>
					: <>When sources disagree, trust the one higher on the list. <b>{LEVELS[0].name}</b> beats <b>{L.name}</b>, because it’s closer to profit.</>}
			</div>
		</div>
	);
}
