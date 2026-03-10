import { json } from '@sveltejs/kit';
import { updateSynth } from '$lib/server/synth-api';

export async function PATCH({ params, request }: { params: { id: string }; request: Request }) {
  try {
    const patch = await request.json();
    const updated = await updateSynth(params.id, patch);

    if (!updated) {
      return json({ error: 'Model not found' }, { status: 404 });
    }

    return json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, { status: 502 });
  }
}
