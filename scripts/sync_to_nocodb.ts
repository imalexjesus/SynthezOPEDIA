import 'dotenv/config';
import { synths } from '../src/lib/data/synths';

type NocoRecord = {
  Id?: number | string;
  id?: number | string;
  synthId?: string;
  synth_id?: string;
  payload?: string;
};

const baseUrl = process.env.NOCODB_BASE_URL?.trim();
const tableId = process.env.NOCODB_TABLE_ID?.trim();
const email = process.env.NOCODB_EMAIL?.trim();
const password = process.env.NOCODB_PASSWORD?.trim();
let token = process.env.NOCODB_AUTH_TOKEN?.trim();

if (!baseUrl || !tableId) {
  throw new Error('Set NOCODB_BASE_URL and NOCODB_TABLE_ID');
}

async function signIn() {
  if (token) return token;
  if (!email || !password) throw new Error('Set NOCODB_AUTH_TOKEN or NOCODB_EMAIL/NOCODB_PASSWORD');

  const response = await fetch(`${baseUrl}/api/v1/auth/user/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(`Signin failed: ${response.status}`);
  }

  const payload = (await response.json()) as { token: string };
  token = payload.token;
  return token;
}

async function headers() {
  const auth = await signIn();
  return {
    'Content-Type': 'application/json',
    'xc-auth': auth
  };
}

async function listAllRecords() {
  const records: NocoRecord[] = [];
  let page = 1;
  let done = false;

  while (!done) {
    const response = await fetch(`${baseUrl}/api/v2/tables/${tableId}/records?page=${page}&limit=200`, {
      headers: await headers()
    });

    if (!response.ok) {
      throw new Error(`List failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      list: NocoRecord[];
      pageInfo?: { isLastPage?: boolean };
    };

    records.push(...(payload.list || []));
    done = Boolean(payload.pageInfo?.isLastPage);
    page += 1;
  }

  return records;
}

function rowId(record: NocoRecord) {
  return record.Id ?? record.id ?? null;
}

function synthId(record: NocoRecord) {
  return record.synthId ?? record.synth_id ?? null;
}

async function createRecord(item: (typeof synths)[number]) {
  const response = await fetch(`${baseUrl}/api/v2/tables/${tableId}/records`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      synthId: item.id,
      payload: JSON.stringify(item)
    })
  });

  if (!response.ok) {
    throw new Error(`Create failed for ${item.id}: ${response.status}`);
  }
}

async function updateRecord(recordId: string | number, item: (typeof synths)[number]) {
  const response = await fetch(`${baseUrl}/api/v2/tables/${tableId}/records`, {
    method: 'PATCH',
    headers: await headers(),
    body: JSON.stringify([
      {
        Id: recordId,
        synthId: item.id,
        payload: JSON.stringify(item)
      }
    ])
  });

  if (!response.ok) {
    throw new Error(`Update failed for ${item.id}: ${response.status}`);
  }
}

const existing = await listAllRecords();
const index = new Map<string, NocoRecord>();
for (const rec of existing) {
  const id = synthId(rec);
  if (id) index.set(id, rec);
}

let created = 0;
let updated = 0;

for (const item of synths) {
  const rec = index.get(item.id);
  const rid = rec ? rowId(rec) : null;

  if (!rid) {
    await createRecord(item);
    created += 1;
  } else {
    await updateRecord(rid, item);
    updated += 1;
  }
}

console.log(`created ${created}`);
console.log(`updated ${updated}`);
