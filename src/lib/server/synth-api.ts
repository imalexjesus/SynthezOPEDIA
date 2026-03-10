import { env } from '$env/dynamic/private';
import { synths, type SynthModel } from '$lib/data/synths';

let runtimeSynths: SynthModel[] = [...synths];

const baseUrl = env.SYNTH_API_BASE_URL?.trim();
const token = env.SYNTH_API_TOKEN?.trim();
const nocoBaseUrl = env.NOCODB_BASE_URL?.trim();
const nocoTableId = env.NOCODB_TABLE_ID?.trim();
const nocoAuthToken = env.NOCODB_AUTH_TOKEN?.trim();
const nocoEmail = env.NOCODB_EMAIL?.trim();
const nocoPassword = env.NOCODB_PASSWORD?.trim();
const pocketBaseUrl = env.POCKETBASE_URL?.trim();
const pocketBaseToken = env.POCKETBASE_TOKEN?.trim();
const pocketBaseCollection = env.POCKETBASE_COLLECTION?.trim() || 'synths';

let cachedNocoAuthToken: string | null = nocoAuthToken || null;

function authHeaders() {
  if (!token) return {} as Record<string, string>;

  return {
    Authorization: `Bearer ${token}`
  } as Record<string, string>;
}

export function hasRemoteApi() {
  return Boolean(baseUrl || pocketBaseUrl || (nocoBaseUrl && nocoTableId));
}

async function getNocoAuthToken() {
  if (cachedNocoAuthToken) return cachedNocoAuthToken;
  if (!nocoBaseUrl || !nocoEmail || !nocoPassword) return null;

  const response = await fetch(`${nocoBaseUrl}/api/v1/auth/user/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: nocoEmail, password: nocoPassword })
  });

  if (!response.ok) {
    throw new Error(`NocoDB auth failed: ${response.status}`);
  }

  const payload = (await response.json()) as { token?: string };
  cachedNocoAuthToken = payload.token ?? null;
  return cachedNocoAuthToken;
}

async function nocoHeaders() {
  const authToken = await getNocoAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { 'xc-auth': authToken } : {})
  };
}

function parseNocoPayload(payload: unknown) {
  if (payload && typeof payload === 'object') return payload as Partial<SynthModel>;
  if (typeof payload !== 'string') return null;

  try {
    return JSON.parse(payload) as Partial<SynthModel>;
  } catch {
    return null;
  }
}

function toSynthModelFromNoco(record: Record<string, unknown>) {
  const parsed = parseNocoPayload(record.payload);
  if (!parsed) return null;
  if (typeof parsed.id !== 'string' || typeof parsed.modelName !== 'string') return null;
  return parsed as SynthModel;
}

function nocoRowId(record: Record<string, unknown>) {
  if (typeof record.Id === 'number' || typeof record.Id === 'string') return record.Id;
  if (typeof record.id === 'number' || typeof record.id === 'string') return record.id;
  return null;
}

async function listFromNocoDb() {
  const items: SynthModel[] = [];
  let page = 1;
  const pageSize = 200;
  let lastPage = false;

  while (!lastPage) {
    const response = await fetch(
      `${nocoBaseUrl}/api/v2/tables/${nocoTableId}/records?page=${page}&limit=${pageSize}`,
      { headers: await nocoHeaders() }
    );

    if (!response.ok) {
      throw new Error(`NocoDB error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      list: Array<Record<string, unknown>>;
      pageInfo?: { isLastPage?: boolean };
    };

    for (const record of payload.list || []) {
      const model = toSynthModelFromNoco(record);
      if (model) items.push(model);
    }

    lastPage = Boolean(payload.pageInfo?.isLastPage);
    page += 1;
  }

  return items;
}

async function findNocoRecordBySynthId(synthId: string) {
  const all = await listNocoRaw();
  return (
    all.find((row) => row.synthId === synthId) ??
    all.find((row) => row.synth_id === synthId) ??
    all.find((row) => {
      const model = toSynthModelFromNoco(row);
      return model?.id === synthId;
    }) ??
    null
  );
}

async function listNocoRaw() {
  const rows: Array<Record<string, unknown>> = [];
  let page = 1;
  const pageSize = 200;
  let lastPage = false;

  while (!lastPage) {
    const response = await fetch(
      `${nocoBaseUrl}/api/v2/tables/${nocoTableId}/records?page=${page}&limit=${pageSize}`,
      { headers: await nocoHeaders() }
    );

    if (!response.ok) {
      throw new Error(`NocoDB error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      list: Array<Record<string, unknown>>;
      pageInfo?: { isLastPage?: boolean };
    };

    rows.push(...(payload.list || []));
    lastPage = Boolean(payload.pageInfo?.isLastPage);
    page += 1;
  }

  return rows;
}

function toSynthModel(record: Record<string, unknown>): SynthModel | null {
  const payload = record.payload ?? record.data;

  if (payload && typeof payload === 'object') {
    const model = payload as Partial<SynthModel>;
    if (typeof model.id === 'string' && typeof model.modelName === 'string') {
      return model as SynthModel;
    }
  }

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload) as Partial<SynthModel>;
      if (typeof parsed.id === 'string' && typeof parsed.modelName === 'string') {
        return parsed as SynthModel;
      }
    } catch {
      return null;
    }
  }

  if (typeof record.id === 'string' && typeof record.modelName === 'string' && typeof record.brand === 'string') {
    return record as unknown as SynthModel;
  }

  return null;
}

async function listFromPocketBase() {
  const items: SynthModel[] = [];
  let page = 1;
  const perPage = 200;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${pocketBaseUrl}/api/collections/${pocketBaseCollection}/records?page=${page}&perPage=${perPage}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(pocketBaseToken ? { Authorization: `Bearer ${pocketBaseToken}` } : {})
        }
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      items: Array<Record<string, unknown>>;
      totalPages: number;
    };

    totalPages = payload.totalPages || 1;
    for (const record of payload.items) {
      const model = toSynthModel(record);
      if (model) items.push(model);
    }

    page += 1;
  }

  return items;
}

async function findPocketBaseRecordBySynthId(synthId: string) {
  const filter = encodeURIComponent(`synthId=\"${synthId}\"`);
  const response = await fetch(
    `${pocketBaseUrl}/api/collections/${pocketBaseCollection}/records?perPage=1&filter=${filter}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(pocketBaseToken ? { Authorization: `Bearer ${pocketBaseToken}` } : {})
      }
    }
  );

  if (!response.ok) {
    throw new Error(`PocketBase error: ${response.status}`);
  }

  const payload = (await response.json()) as { items: Array<Record<string, unknown>> };
  return payload.items[0] ?? null;
}

export async function listSynths() {
  if (nocoBaseUrl && nocoTableId) {
    const remote = await listFromNocoDb();
    return remote.length > 0 ? remote : runtimeSynths;
  }

  if (pocketBaseUrl) {
    return listFromPocketBase();
  }

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
  if (nocoBaseUrl && nocoTableId) {
    const record = await findNocoRecordBySynthId(id);
    if (!record) {
      const baseModel = runtimeSynths.find((item) => item.id === id);
      if (!baseModel) return null;

      const next = { ...baseModel, ...patch };
      const createResponse = await fetch(`${nocoBaseUrl}/api/v2/tables/${nocoTableId}/records`, {
        method: 'POST',
        headers: await nocoHeaders(),
        body: JSON.stringify({
          synthId: next.id,
          payload: JSON.stringify(next)
        })
      });

      if (!createResponse.ok) {
        throw new Error(`NocoDB error: ${createResponse.status}`);
      }

      return next;
    }

    const rowId = nocoRowId(record);
    const current = toSynthModelFromNoco(record);
    if (!rowId || !current) return null;

    const next = { ...current, ...patch };
    const response = await fetch(`${nocoBaseUrl}/api/v2/tables/${nocoTableId}/records`, {
      method: 'PATCH',
      headers: await nocoHeaders(),
      body: JSON.stringify([
        {
          Id: rowId,
          synthId: next.id,
          payload: JSON.stringify(next)
        }
      ])
    });

    if (!response.ok) {
      throw new Error(`NocoDB error: ${response.status}`);
    }

    return next;
  }

  if (pocketBaseUrl) {
    const record = await findPocketBaseRecordBySynthId(id);
    if (!record || typeof record.id !== 'string') return null;

    const current = toSynthModel(record);
    if (!current) return null;

    const next = { ...current, ...patch };
    const body = record.payload !== undefined ? { payload: next } : patch;

    const response = await fetch(
      `${pocketBaseUrl}/api/collections/${pocketBaseCollection}/records/${record.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(pocketBaseToken ? { Authorization: `Bearer ${pocketBaseToken}` } : {})
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase error: ${response.status}`);
    }

    return next;
  }

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
