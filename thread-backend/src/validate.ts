const MAX_MESSAGES = 40;
const MAX_CONTENT_LENGTH = 4000;
const MAX_ENTRIES = 31;

export type ChatMessageIn = { role: 'user' | 'assistant'; content: string };

export type PatternEntryIn = {
	date: string;
	mood: string | null;
	sleepQuality: string | null;
	symptoms: string[];
};

export function validateChatBody(body: unknown):
	| { ok: true; messages: ChatMessageIn[]; profile: unknown }
	| { ok: false; error: string } {
	if (!body || typeof body !== 'object') {
		return { ok: false, error: 'Invalid JSON body' };
	}
	const record = body as Record<string, unknown>;
	if (!Array.isArray(record.messages)) {
		return { ok: false, error: 'messages array required' };
	}
	if (record.messages.length === 0) {
		return { ok: false, error: 'messages must not be empty' };
	}
	if (record.messages.length > MAX_MESSAGES) {
		return { ok: false, error: `messages limited to ${MAX_MESSAGES}` };
	}

	const messages: ChatMessageIn[] = [];
	for (const item of record.messages) {
		if (!item || typeof item !== 'object') {
			return { ok: false, error: 'each message must be an object' };
		}
		const msg = item as Record<string, unknown>;
		if (msg.role !== 'user' && msg.role !== 'assistant') {
			return { ok: false, error: 'message role must be user or assistant' };
		}
		if (typeof msg.content !== 'string') {
			return { ok: false, error: 'message content must be a string' };
		}
		if (msg.content.length > MAX_CONTENT_LENGTH) {
			return {
				ok: false,
				error: `message content limited to ${MAX_CONTENT_LENGTH} characters`,
			};
		}
		messages.push({ role: msg.role, content: msg.content });
	}

	return { ok: true, messages, profile: record.profile ?? null };
}

export function validatePatternBody(body: unknown):
	| { ok: true; profile: unknown; entries: PatternEntryIn[] }
	| { ok: false; error: string } {
	if (!body || typeof body !== 'object') {
		return { ok: false, error: 'Invalid JSON body' };
	}
	const record = body as Record<string, unknown>;
	const rawEntries = record.entries ?? [];
	if (!Array.isArray(rawEntries)) {
		return { ok: false, error: 'entries must be an array' };
	}
	if (rawEntries.length > MAX_ENTRIES) {
		return { ok: false, error: `entries limited to ${MAX_ENTRIES}` };
	}

	const entries: PatternEntryIn[] = [];
	for (const item of rawEntries) {
		if (!item || typeof item !== 'object') {
			return { ok: false, error: 'each entry must be an object' };
		}
		const entry = item as Record<string, unknown>;
		if (typeof entry.date !== 'string' || !entry.date.trim()) {
			return { ok: false, error: 'entry date must be a string' };
		}
		const mood = entry.mood == null ? null : String(entry.mood);
		const sleepQuality =
			entry.sleepQuality == null ? null : String(entry.sleepQuality);
		const symptoms = Array.isArray(entry.symptoms)
			? entry.symptoms.map(String)
			: [];
		entries.push({ date: entry.date, mood, sleepQuality, symptoms });
	}

	return { ok: true, profile: record.profile ?? null, entries };
}
