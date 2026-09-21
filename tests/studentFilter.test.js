import assert from "node:assert/strict";
import test from "node:test";

import { buildStudentFilter, parsePagination } from "../utils/studentFilter.js";

test("buildStudentFilter parses semester and department", () => {
  const { filter, errors } = buildStudentFilter({
    semester: "4",
    department: "CS+",
  });

  assert.deepEqual(errors, []);
  assert.equal(filter.semester, 4);
  assert.equal(filter.department.$regex, "CS\\+");
  assert.equal(filter.department.$options, "i");
});

test("buildStudentFilter rejects an invalid semester", () => {
  const { errors } = buildStudentFilter({ semester: "9" });
  assert.ok(errors.length);
});

test("parsePagination clamps page and limit", () => {
  assert.deepEqual(parsePagination({ page: "0", limit: "999" }, { maxLimit: 200 }), {
    page: 1,
    limit: 200,
    skip: 0,
  });
});
