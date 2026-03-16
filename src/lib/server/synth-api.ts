import { env } from '$env/dynamic/private';
import { synths, type SynthModel } from '$lib/data/synths';
import * as fs from 'fs/promises';
import * as path from 'path';

let runtimeSynths: SynthModel[] = [...synths];

const DATA_FILE = path.join(process.cwd(), 'data', 'synths.json');

async function loadFromFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const loaded = JSON.parse(data) as SynthModel[];
    if (loaded.length > 0) {
      runtimeSynths = loaded;
      console.log(`📂 Loaded ${loaded.length} synths from local file`);
    }
  } catch (e) {
    // File doesn't exist or is invalid, use defaults
  }
}

async function saveToFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(runtimeSynths, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving to file:', e);
  }
}

// Load from file on startup
loadFromFile();

const nocoBaseUrl = env.NOCODB_BASE_URL?.trim();
const nocoTableId = env.NOCODB_TABLE_ID?.trim();
const nocoAuthToken = env.NOCODB_AUTH_TOKEN?.trim();
const nocoEmail = env.NOCODB_EMAIL?.trim();
const nocoPassword = env.NOCODB_PASSWORD?.trim();

let cachedNocoAuthToken: string | null = nocoAuthToken || null;

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

export function hasRemoteApi() {
  return Boolean(nocoBaseUrl && nocoTableId);
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

  return (
    rows.find((row) => row.synthId === synthId) ??
    rows.find((row) => row.synth_id === synthId) ??
    rows.find((row) => {
      const model = toSynthModelFromNoco(row);
      return model?.id === synthId;
    }) ??
    null
  );
}

export async function listSynths() {
  if (!nocoBaseUrl || !nocoTableId) {
    return runtimeSynths;
  }

  try {
    const remote = await listFromNocoDb();
    return remote.length > 0 ? remote : runtimeSynths;
  } catch (error) {
    console.error('NocoDB fetch failed, falling back to local:', error);
    return runtimeSynths;
  }
}

export async function updateSynth(id: string, patch: Partial<SynthModel>) {
  if (!nocoBaseUrl || !nocoTableId) {
    const index = runtimeSynths.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const next = { ...runtimeSynths[index], ...patch };
    runtimeSynths[index] = next;
    return next;
  }

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
