import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manifest uses standalone display and MyDays name", async () => {
  const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, "MyDays");
  assert.equal(manifest.display, "standalone");
});

test("service worker lists core app assets", async () => {
  const source = await readFile("sw.js", "utf8");
  for (const asset of ["index.html", "styles.css", "src/app.js", "src/state.js", "src/storage.js"]) {
    assert.equal(source.includes(asset), true, `${asset} missing from service worker`);
  }
});

test("index registers manifest and module script", async () => {
  const html = await readFile("index.html", "utf8");
  assert.equal(html.includes("manifest.webmanifest"), true);
  assert.equal(html.includes('type="module"'), true);
});
