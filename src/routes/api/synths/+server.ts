import { json } from '@sveltejs/kit';
import { hasRemoteApi, listSynths } from '$lib/server/synth-api';

export async function GET({ url }: { url: URL }) {
  try {
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    let data = await listSynths();
    
    // Фильтруем неактивные (по умолчанию скрыты)
    if (!includeInactive) {
      data = data.filter(s => s.isActive !== false);
    }
    
    return json({ items: data, source: hasRemoteApi() ? 'remote' : 'local' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, { status: 502 });
  }
}
