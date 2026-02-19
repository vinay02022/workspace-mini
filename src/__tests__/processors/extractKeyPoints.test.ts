import { extractKeyPoints } from "@/processors/extractKeyPoints";

// Mock the gemini module
jest.mock("@/lib/gemini", () => ({
    isLlmAvailable: jest.fn().mockReturnValue(false),
    getGeminiModel: jest.fn(),
}));

describe("extractKeyPoints processor", () => {
    it("extracts bullet points from multiple sentences", async () => {
        const input =
            "Machine learning is transforming industries worldwide. Companies invest billions in AI research. " +
            "Natural language processing enables chatbots. Computer vision powers autonomous vehicles. " +
            "Deep learning requires large datasets for training.";
        const result = await extractKeyPoints(input);
        expect(result.output).toContain("- ");
        expect(result.usedLlm).toBe(false);
    });

    it("filters out short sentences (under 10 chars)", async () => {
        const input = "Hi. This is a much longer sentence that should be included. Ok. Another reasonable length sentence here.";
        const result = await extractKeyPoints(input);
        // Short sentences like "Hi." and "Ok." should be filtered out
        expect(result.output).not.toContain("- Hi.");
        expect(result.output).not.toContain("- Ok.");
        expect(result.usedLlm).toBe(false);
    });

    it("returns up to 5 key points", async () => {
        const input =
            "First important point about technology. Second crucial finding about science. " +
            "Third significant observation about society. Fourth notable trend in business. " +
            "Fifth key insight about education. Sixth additional point about health. " +
            "Seventh extra detail about environment.";
        const result = await extractKeyPoints(input);
        const bulletPoints = result.output.split("\n").filter((line) => line.startsWith("- "));
        expect(bulletPoints.length).toBeLessThanOrEqual(5);
    });

    it("handles empty string", async () => {
        const result = await extractKeyPoints("");
        expect(result.output).toBe("");
        expect(result.usedLlm).toBe(false);
    });

    it("handles single long sentence", async () => {
        const input = "This is a single but sufficiently long sentence about artificial intelligence and its impact on modern society.";
        const result = await extractKeyPoints(input);
        expect(result.output).toContain("- ");
        expect(result.usedLlm).toBe(false);
    });
});
