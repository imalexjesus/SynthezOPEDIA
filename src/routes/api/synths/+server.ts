import { json } from '@sveltejs/kit';
import { hasRemoteApi, listSynths } from '$lib/server/synth-api';

export async function GET() {
  try {
    const data = await listSynths();
    return json({ items: data, source: hasRemoteApi() ? 'remote' : 'local' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, { status: 502 });
  }
}
