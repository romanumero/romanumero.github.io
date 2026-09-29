// Sends a Plausible custom event. A no-op when Plausible isn't loaded (dev builds, blockers).
// Each event name needs a matching custom-event goal in Plausible before it shows in the dashboard.
declare global {
	interface Window {
		plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
	}
}

export function track(event: string, props?: Record<string, string>) {
	window.plausible?.(event, props ? { props } : undefined);
}
