import { test } from "node:test";
import assert from "node:assert/strict";

import { renderEntryAsMarkdown } from "../src/_internal/transform.js";

const python = "```python\nif ready:\n    for item in items:\n        run(item)\nfinish()\n```";

test("preserves indentation in flush-left fenced code", () => {
  assert.equal(renderEntryAsMarkdown({ body: python }), python);
});

for (const indent of ["", "  ", "    ", "\t"]) {
  test(`removes only the fence's enclosing indentation in Tabs (${JSON.stringify(indent)})`, () => {
    const body = `<Tabs>\n<TabItem label="Python">\n${python
      .split("\n")
      .map((line) => indent + line)
      .join("\n")}\n</TabItem>\n</Tabs>`;
    assert.equal(renderEntryAsMarkdown({ body }), `### Python\n\n${python}`);
  });
}

test("keeps code whitespace and literal MDX intact during prose cleanup", () => {
  const code = [
    "```text",
    "  ### Heading",
    "  - **Item**",
    "  1. **Step**",
    "\tindented",
    "    ",
    "",
    "",
    '<Render file="example" />',
    "<Aside>literal</Aside>",
    "```",
  ].join("\n");
  const body = `\nBefore\n\n\n\n${code}\n\n\nAfter\n`;
  assert.equal(
    renderEntryAsMarkdown({ body }),
    `Before\n\n${code}\n\nAfter`,
  );
});

test("does not remove code indentation that differs from the fence prefix", () => {
  const body = "<Wrapper>\n    ```text\n  less indented\n\tother indent\n    aligned\n        nested\n    ```\n</Wrapper>";
  assert.equal(
    renderEntryAsMarkdown({ body }),
    "```text\n  less indented\n\tother indent\naligned\n    nested\n```",
  );
});

test("still protects fenced code inside a Markdown blockquote", () => {
  const body = '> ```mdx\n> <Render file="example" />\n> <Aside>literal</Aside>\n> ```';
  assert.equal(renderEntryAsMarkdown({ body }), body);
});
