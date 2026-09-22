const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadGet(role = 'admin') {
  const calls = {};
  const chain = {
    sort: () => chain,
    skip: (offset) => { calls.offset = offset; return chain; },
    limit: () => chain,
    lean: async () => [],
  };
  const mocks = {
    '@clerk/nextjs/server': { auth: async () => ({ userId: 'viewer' }) },
    'next/server': { NextResponse: Response },
    '@/lib/roles': { getCurrentUserRole: async () => role },
    '@/lib/mongoose': { mongooseConnect: async () => {} },
    '@/models/TelegramAllowlist': { TelegramAllowlist: {
      find: (filter) => { calls.filter = filter; return chain; },
      countDocuments: async (filter) => { calls.countFilter = filter; return 0; },
    } },
  };
  const context = vm.createContext({ exports: {}, URL, require: (name) => mocks[name] });
  vm.runInContext(ts.transpileModule(readFileSync('app/api/admin/telegram-allowlist/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  return { GET: context.exports.GET, calls };
}

test('Telegram account filters support pending, approved and disabled with matching counts', async () => {
  for (const status of ['pending', 'approved', 'disabled']) {
    const { GET, calls } = loadGet();
    const response = await GET(new Request(`http://localhost/api/admin/telegram-allowlist?status=${status}&offset=10`));
    assert.equal(response.status, 200);
    const filter = JSON.parse(JSON.stringify(calls.filter));
    assert.deepEqual(filter, status === 'pending'
      ? { $or: [{ status: 'pending' }, { status: { $exists: false } }] }
      : { status });
    assert.equal(calls.filter, calls.countFilter);
    assert.equal(calls.offset, 10);
  }
});

test('Telegram search preserves selected status and treats regex characters literally', async () => {
  const { GET, calls } = loadGet();
  await GET(new Request('http://localhost/api/admin/telegram-allowlist?status=disabled&query=a.b'));
  assert.equal(calls.filter.$and[0].status, 'disabled');
  assert.equal(calls.filter.$and[1].$or[0].firstName.$regex, 'a\\.b');
});

test('Telegram list defaults to pending and rejects invalid filters and non-admins', async () => {
  const { GET, calls } = loadGet();
  await GET(new Request('http://localhost/api/admin/telegram-allowlist'));
  assert.equal(calls.filter.$or[0].status, 'pending');
  assert.equal((await GET(new Request('http://localhost/api/admin/telegram-allowlist?status=unknown'))).status, 400);
  const denied = loadGet('teacher');
  assert.equal((await denied.GET(new Request('http://localhost/api/admin/telegram-allowlist?status=approved'))).status, 403);
  assert.equal(denied.calls.filter, undefined);
});
