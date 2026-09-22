const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadPage(access) {
  const calls = {};
  const courses = [
    { _id: 'own', userId: 'teacher-a', title: 'Own course', isPublished: true },
    { _id: 'other', userId: 'teacher-b', title: 'Other course', isPublished: true },
    { _id: 'draft', userId: 'teacher-a', title: 'Draft', isPublished: false },
  ];
  const purchases = [
    { courseId: 'own', userId: 'shared', createdAt: new Date() },
    { courseId: 'other', userId: 'shared', createdAt: new Date() },
    { courseId: 'other', userId: 'other-student', createdAt: new Date() },
    { courseId: 'draft', userId: 'draft-student', createdAt: new Date() },
  ];
  const chapters = courses.map((course) => ({ _id: `${course._id}-lesson`, courseId: course._id, title: 'Lesson', isPublished: true }));
  const matches = (record, query) => Object.entries(query).every(([key, value]) =>
    value && typeof value === 'object' && '$in' in value ? value.$in.includes(record[key]) : record[key] === value);
  const query = (records) => (filter) => ({ lean: async () => records.filter((record) => matches(record, filter)) });
  const mocks = {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'lucide-react': {},
    'next/navigation': { redirect: () => { throw new Error('redirect'); } },
    '@/lib/roles': { requireRole: async () => access },
    '@/lib/mongoose': { mongooseConnect: async () => {} },
    '@/models/Course': { Course: { find: (filter) => { calls.courseFilter = filter; return query(courses)(filter); } } },
    '@/models/Chapter': { Chapter: { find: query(chapters) } },
    '@/models/Purchase': { Purchase: {
      find: query(purchases),
      distinct: async (field, filter) => [...new Set(purchases.filter((record) => matches(record, filter)).map((record) => record[field]))],
    } },
    '@/models/UserProgress': { UserProgress: { find: query([
      { userId: 'shared', chapterId: 'own-lesson', isCompleted: true },
      { userId: 'shared', chapterId: 'other-lesson', isCompleted: true },
      { userId: 'other-student', chapterId: 'other-lesson', isCompleted: true },
    ]) } },
    '@clerk/nextjs/server': { clerkClient: async () => ({ users: { getUserList: async () => ({
      totalCount: 4,
      data: ['shared', 'other-student', 'draft-student', 'unenrolled'].map((id) => ({ id, fullName: id, publicMetadata: {}, createdAt: 0, lastSignInAt: null })),
    }) } }) },
    '@/lib/analytics': { summarizeAnalytics: (data) => {
      calls.data = data;
      return { popularCourses: [], popularLessons: [], topStudents: [], months: [], totalStudents: data.students.length,
        newStudents: 0, signedInStudents: 0, publishedCourses: data.courses.length, publishedChapters: data.chapters.length, totalEnrollments: data.enrollments.length };
    } },
    './_components/activity-chart': { ActivityChart: () => null },
  };
  const context = vm.createContext({ exports: {}, require: (name) => {
    assert.ok(name in mocks, `Unexpected dependency ${name}`);
    return mocks[name];
  } });
  vm.runInContext(ts.transpileModule(readFileSync('app/(dashboard)/(routes)/teacher/analytics/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  return { render: context.exports.default, calls };
}

test('teacher analytics excludes other creators, their students, drafts, and unrelated progress', async () => {
  const { render, calls } = loadPage({ role: 'teacher', user: { id: 'teacher-a' } });
  await render();
  assert.equal(calls.courseFilter.userId, 'teacher-a');
  assert.equal(calls.data.courses.length, 1);
  assert.equal(calls.data.courses[0].id, 'own');
  assert.equal(calls.data.students.length, 1);
  assert.equal(calls.data.students[0].id, 'shared');
  assert.equal(calls.data.enrollments.length, 1);
  assert.equal(calls.data.chapters.length, 1);
  assert.equal(calls.data.completions.length, 1);
  assert.equal(calls.data.completions[0].chapterId, 'own-lesson');
});

test('admin analytics remains school-wide', async () => {
  const { render, calls } = loadPage({ role: 'admin', user: { id: 'admin' } });
  await render();
  assert.equal(calls.courseFilter.userId, undefined);
  assert.equal(calls.data.courses.length, 2);
  assert.equal(calls.data.students.length, 4);
  assert.equal(calls.data.enrollments.length, 3);
  assert.equal(calls.data.completions.length, 3);
});

test('teacher without published courses sees empty analytics', async () => {
  const { render, calls } = loadPage({ role: 'teacher', user: { id: 'new-teacher' } });
  await render();
  for (const value of Object.values(calls.data)) assert.equal(value.length, 0);
});

test('unauthorized viewers are redirected before analytics queries', async () => {
  const { render, calls } = loadPage(null);
  await assert.rejects(render, /redirect/);
  assert.equal(calls.courseFilter, undefined);
});
