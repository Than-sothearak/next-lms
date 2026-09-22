const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const context = vm.createContext({ exports: {} });
vm.runInContext(ts.transpileModule(readFileSync('lib/analytics.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, context);
const { summarizeAnalytics } = context.exports;
const now = Date.parse('2026-01-15T12:00:00Z');
const empty = { students: [], courses: [], chapters: [], enrollments: [], completions: [] };

test('empty analytics has six zero-filled months across the year boundary', () => {
  const result = summarizeAnalytics(empty, now);
  assert.equal(result.totalStudents, 0);
  assert.equal(result.totalEnrollments, 0);
  assert.equal(result.topStudents.length, 0);
  assert.equal(result.popularCourses.length, 0);
  assert.equal(result.popularLessons.length, 0);
  assert.equal(result.months.length, 6);
  assert.equal(result.months[0].label, 'Aug 2025');
  assert.equal(result.months[5].label, 'Jan 2026');
  assert.ok(result.months.every((month) => month.students === 0 && month.enrollments === 0));
});

test('enrollments and completions are unique and exclude accounts and courses outside the dataset', () => {
  const result = summarizeAnalytics({
    students: [
      { id: 'a', name: 'Amy', createdAt: now, lastSignInAt: now },
      { id: 'b', name: 'Ben', createdAt: 0, lastSignInAt: null },
    ],
    courses: [{ id: 'c', title: 'Course' }, { id: 'empty', title: 'No lessons' }],
    chapters: [{ id: 'one', title: 'Lesson one', courseId: 'c' }, { id: 'two', title: 'Lesson two', courseId: 'c' }, { id: 'draft', title: 'Hidden', courseId: 'hidden' }],
    enrollments: [
      { userId: 'a', courseId: 'c', createdAt: now },
      { userId: 'a', courseId: 'c', createdAt: Date.parse('2025-12-01T00:00:00Z') },
      { userId: 'a', courseId: 'empty', createdAt: now },
      { userId: 'b', courseId: 'c', createdAt: now },
      { userId: 'deleted', courseId: 'c', createdAt: now },
      { userId: 'a', courseId: 'hidden', createdAt: now },
    ],
    completions: [
      { userId: 'a', chapterId: 'one' }, { userId: 'a', chapterId: 'one' },
      { userId: 'a', chapterId: 'two' }, { userId: 'b', chapterId: 'one' },
      { userId: 'a', chapterId: 'draft' }, { userId: 'deleted', chapterId: 'two' },
    ],
  }, now);
  assert.equal(result.totalEnrollments, 3);
  assert.equal(result.publishedChapters, 2);
  assert.equal(result.popularCourses[0].enrollments, 2);
  assert.equal(result.popularLessons.length, 2);
  assert.equal(result.popularLessons[0].id, 'one');
  assert.equal(result.popularLessons[0].completions, 2);
  assert.equal(result.popularLessons[0].courseTitle, 'Course');
  assert.equal(result.popularLessons[1].completions, 1);
  assert.equal(result.topStudents[0].id, 'a');
  assert.equal(result.topStudents[0].completedCourses, 1);
  assert.equal(result.topStudents[0].completedChapters, 2);
  assert.equal(result.topStudents[1].completedCourses, 0);
  assert.equal(result.months[4].enrollments, 1);
  assert.equal(result.months[5].enrollments, 2);
});

test('recent signup and login counts use the last 30 days and handle null and future dates', () => {
  const boundary = now - 30 * 86400000;
  const result = summarizeAnalytics({ ...empty, students: [
    { id: 'a', name: 'A', createdAt: boundary, lastSignInAt: boundary },
    { id: 'b', name: 'B', createdAt: boundary - 1, lastSignInAt: boundary - 1 },
    { id: 'c', name: 'C', createdAt: now, lastSignInAt: null },
    { id: 'd', name: 'D', createdAt: now + 1, lastSignInAt: now + 1 },
  ] }, now);
  assert.equal(result.totalStudents, 4);
  assert.equal(result.newStudents, 2);
  assert.equal(result.signedInStudents, 1);
  assert.equal(result.months[5].students, 1);
});
