import { env } from '$env/dynamic/private';
import { synths, type SynthModel } from '$lib/data/synths';

let runtimeSynths: SynthModel[] = [...synths];

const baseUrl = env.SYNTH_API_BASE_URL?.trim();
const token = env.SYNTH_API_TOKEN?.trim();

function authHeaders() {
  if (!token) return {} as Record<string, string>;

  return {
    Authorization: `Bearer ${token}`
  } as Record<string, string>;
}

export function hasRemoteApi() {
  return Boolean(baseUrl);
}

export async function listSynths() {
  if (!baseUrl) {
    return runtimeSynths;
  }

  const response = await fetch(`${baseUrl}/synths`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const payload = (await response.json()) as SynthModel[];
  return payload;
}

export async function updateSynth(id: string, patch: Partial<SynthModel>) {
  if (!baseUrl) {
    const index = runtimeSynths.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const next = { ...runtimeSynths[index], ...patch };
    runtimeSynths[index] = next;
    return next;
  }

  const response = await fetch(`${baseUrl}/synths/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const payload = (await response.json()) as SynthModel;
  return payload;
}
