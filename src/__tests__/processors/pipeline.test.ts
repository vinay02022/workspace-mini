import { runPipeline, processorRegistry } from "@/processors";

// Mock the gemini module
jest.mock("@/lib/gemini", () => ({
    isLlmAvailable: jest.fn().mockReturnValue(false),
    getGeminiModel: jest.fn(),
}));

describe("Pipeline Runner", () => {
    it("executes steps sequentially and chains outputs", async () => {
        const steps = [
            { type: "clean_text", order: 1 },
            { type: "summarize", order: 2 },
        ];

        const input = "   First sentence. Second sentence. Third sentence. Fourth sentence.   ";
        const outputs = await runPipeline(steps, input);

        expect(outputs).toHaveLength(2);
        // First step: clean_text
        expect(outputs[0].stepType).toBe("clean_text");
        expect(outputs[0].stepOrder).toBe(1);
        expect(outputs[0].input).toBe(input);
        expect(outputs[0].usedLlm).toBe(false);

        // Second step: summarize uses output from clean_text as input
        expect(outputs[1].stepType).toBe("summarize");
        expect(outputs[1].stepOrder).toBe(2);
        expect(outputs[1].input).toBe(outputs[0].output);
    });

    it("records timing for each step", async () => {
        const steps = [{ type: "clean_text", order: 1 }];
        const outputs = await runPipeline(steps, "hello world");

        expect(outputs[0].durationMs).toBeGreaterThanOrEqual(0);
        expect(typeof outputs[0].durationMs).toBe("number");
    });

    it("throws error for unknown step type", async () => {
        const steps = [{ type: "nonexistent_step", order: 1 }];

        await expect(runPipeline(steps, "test input")).rejects.toThrow(
            "Unknown step type: nonexistent_step"
        );
    });

    it("executes steps in correct order regardless of array order", async () => {
        const steps = [
            { type: "summarize", order: 2 },
            { type: "clean_text", order: 1 },
        ];

        const input = "  Hello world. Test input.  ";
        const outputs = await runPipeline(steps, input);

        expect(outputs[0].stepType).toBe("clean_text");
        expect(outputs[1].stepType).toBe("summarize");
    });

    it("handles 4-step pipeline", async () => {
        const steps = [
            { type: "clean_text", order: 1 },
            { type: "summarize", order: 2 },
            { type: "extract_key_points", order: 3 },
            { type: "tag_category", order: 4 },
        ];

        const input =
            "Machine learning is a branch of artificial intelligence. " +
            "It involves training algorithms on data. " +
            "Deep learning is a subset of machine learning. " +
            "Neural networks power many modern AI systems.";

        const outputs = await runPipeline(steps, input);

        expect(outputs).toHaveLength(4);
        outputs.forEach((output, index) => {
            expect(output.stepOrder).toBe(index + 1);
            expect(output.output.length).toBeGreaterThan(0);
        });
    });

    it("all registered processors are valid", () => {
        const expectedTypes = ["clean_text", "summarize", "extract_key_points", "tag_category"];
        expectedTypes.forEach((type) => {
            expect(processorRegistry[type]).toBeDefined();
            expect(typeof processorRegistry[type]).toBe("function");
        });
    });
});
