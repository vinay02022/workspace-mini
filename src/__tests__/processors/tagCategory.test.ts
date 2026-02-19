import { tagCategory } from "@/processors/tagCategory";

// Mock the gemini module
jest.mock("@/lib/gemini", () => ({
    isLlmAvailable: jest.fn().mockReturnValue(false),
    getGeminiModel: jest.fn(),
}));

describe("tagCategory processor", () => {
    it("tags technology-related text", async () => {
        const input = "Machine learning and artificial intelligence software are revolutionizing computer programming.";
        const result = await tagCategory(input);
        expect(result.output).toContain("Tags:");
        expect(result.output.toLowerCase()).toContain("technology");
        expect(result.usedLlm).toBe(false);
    });

    it("tags business-related text", async () => {
        const input = "The company reported record revenue and profit this quarter, with strong customer growth driving sales.";
        const result = await tagCategory(input);
        expect(result.output).toContain("Tags:");
        expect(result.output.toLowerCase()).toContain("business");
        expect(result.usedLlm).toBe(false);
    });

    it("tags health-related text", async () => {
        const input = "The medical treatment showed clinical improvement in patient outcomes for the disease.";
        const result = await tagCategory(input);
        expect(result.output).toContain("Tags:");
        expect(result.output.toLowerCase()).toContain("health");
        expect(result.usedLlm).toBe(false);
    });

    it("returns max 3 tags", async () => {
        const input =
            "The government policy on climate and sustainable energy investment affects medical research " +
            "student education and software company revenue in a digital market.";
        const result = await tagCategory(input);
        const tags = result.output.replace("Tags: ", "").split(", ");
        expect(tags.length).toBeLessThanOrEqual(3);
    });

    it("returns 'general' tag for unrecognized text", async () => {
        const input = "Random words that do not match any category keywords at all.";
        const result = await tagCategory(input);
        expect(result.output).toBe("Tags: general");
        expect(result.usedLlm).toBe(false);
    });

    it("handles empty string", async () => {
        const result = await tagCategory("");
        expect(result.output).toBe("Tags: general");
        expect(result.usedLlm).toBe(false);
    });

    it("handles text matching multiple categories", async () => {
        const input = "The government invested in renewable energy research to study climate change pollution and ecosystem impact.";
        const result = await tagCategory(input);
        expect(result.output).toContain("Tags:");
        // Should detect both environment and science/politics
        expect(result.usedLlm).toBe(false);
    });
});
