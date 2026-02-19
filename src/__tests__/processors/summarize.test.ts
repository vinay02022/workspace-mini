import { summarize } from "@/processors/summarize";

// Mock the gemini module
jest.mock("@/lib/gemini", () => ({
    isLlmAvailable: jest.fn().mockReturnValue(false),
    getGeminiModel: jest.fn(),
}));

describe("summarize processor", () => {
    it("returns first 3 sentences for long text", async () => {
        const input = "First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.";
        const result = await summarize(input);
        expect(result.output).toBe("First sentence. Second sentence. Third sentence.");
        expect(result.usedLlm).toBe(false);
    });

    it("returns all sentences when text has 3 or fewer", async () => {
        const input = "Only one sentence. And another one.";
        const result = await summarize(input);
        expect(result.output).toBe("Only one sentence. And another one.");
        expect(result.usedLlm).toBe(false);
    });

    it("handles single sentence", async () => {
        const input = "Just a single sentence here.";
        const result = await summarize(input);
        expect(result.output).toBe("Just a single sentence here.");
        expect(result.usedLlm).toBe(false);
    });

    it("handles empty string", async () => {
        const result = await summarize("");
        expect(result.output).toBe("");
        expect(result.usedLlm).toBe(false);
    });

    it("handles sentences with question marks and exclamation marks", async () => {
        const input = "What happened? Something amazing! It was great. But then it ended.";
        const result = await summarize(input);
        expect(result.output).toBe("What happened? Something amazing! It was great.");
        expect(result.usedLlm).toBe(false);
    });
});
