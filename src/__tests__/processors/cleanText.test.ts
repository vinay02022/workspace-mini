import { cleanText } from "@/processors/cleanText";

describe("cleanText processor", () => {
  it("trims leading and trailing whitespace", async () => {
    const result = await cleanText("  hello world  ");
    expect(result.output).toBe("hello world");
    expect(result.usedLlm).toBe(false);
  });

  it("normalizes multiple spaces to single space", async () => {
    const result = await cleanText("hello    world    test");
    expect(result.output).toBe("hello world test");
  });

  it("collapses multiple blank lines", async () => {
    const result = await cleanText("line one\n\n\n\n\nline two");
    expect(result.output).toBe("line one\n\nline two");
  });

  it("trims each line", async () => {
    const result = await cleanText("  hello  \n  world  ");
    expect(result.output).toBe("hello\nworld");
  });

  it("handles empty string", async () => {
    const result = await cleanText("");
    expect(result.output).toBe("");
    expect(result.usedLlm).toBe(false);
  });

  it("handles string with only whitespace", async () => {
    const result = await cleanText("   \n\n   \n   ");
    expect(result.output).toBe("");
  });

  it("preserves single newlines between content", async () => {
    const result = await cleanText("line one\nline two\nline three");
    expect(result.output).toBe("line one\nline two\nline three");
  });
});
