const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the handlers with the Promise-based route params and Clerk APIs.
// All account changes are mocked; these tests never contact Clerk.
function loadHandlers({ userId = "admin", role = "admin" } = {}) {
  const calls = [];
  const mocks = {
    "@clerk/nextjs/server": {
      auth: async () => ({ userId }),
      clerkClient: async () => ({
        users: {
          updateUser: async (...args) => calls.push(["update", ...args]),
          deleteUser: async (...args) => calls.push(["delete", ...args]),
        },
      }),
    },
    "@/lib/roles": { getCurrentUserRole: async () => role },
    "next/server": { NextResponse: Response },
  };
  const source = readFileSync("app/api/admin/users/[userId]/route.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = vm.createContext({
    exports: {},
    require: (name) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
  });
  vm.runInContext(outputText, context);
  return { ...context.exports, calls };
}

const params = (userId) => ({ params: Promise.resolve({ userId }) });
const roleRequest = (role) => new Request("http://localhost/api/admin/users/student", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role }),
});

test("admin can update a user through asynchronous Clerk and route APIs", async () => {
  const { PATCH, calls } = loadHandlers();
  const response = await PATCH(roleRequest("teacher"), params("student"));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "update");
  assert.equal(calls[0][1], "student");
  assert.equal(calls[0][2].publicMetadata.role, "teacher");
});

test("unauthenticated users and students cannot change accounts", async () => {
  for (const identity of [{ userId: null }, { userId: "student", role: "student" }]) {
    const { PATCH, DELETE, calls } = loadHandlers(identity);
    assert.equal((await PATCH(roleRequest("teacher"), params("other"))).status, 403);
    assert.equal((await DELETE(null, params("other"))).status, 403);
    assert.equal(calls.length, 0);
  }
});

test("invalid roles and self-deletion do not mutate Clerk accounts", async () => {
  const { PATCH, DELETE, calls } = loadHandlers();
  assert.equal((await PATCH(roleRequest("admin"), params("student"))).status, 400);
  assert.equal((await DELETE(null, params("admin"))).status, 400);
  assert.equal(calls.length, 0);
});

test("admin can delete another user with Promise-based params", async () => {
  const { DELETE, calls } = loadHandlers();
  assert.equal((await DELETE(null, params("student"))).status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "delete");
  assert.equal(calls[0][1], "student");
});
