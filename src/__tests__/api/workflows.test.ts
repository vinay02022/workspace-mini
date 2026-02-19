import { POST } from "@/app/api/workflows/route";
import { NextRequest } from "next/server";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
    prisma: {
        workflow: {
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockImplementation(({ data }) => {
                return Promise.resolve({
                    id: "test-workflow-id",
                    name: data.name,
                    description: data.description || "",
                    steps: (data.steps?.create || []).map((s: { type: string; order: number }, i: number) => ({
                        id: `step-${i}`,
                        type: s.type,
                        order: s.order,
                        config: "{}",
                    })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }),
        },
    },
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
    logger: {
        child: () => ({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        }),
    },
}));

function createPostRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("POST /api/workflows", () => {
    it("returns 400 when name is missing", async () => {
        const request = createPostRequest({ steps: [{ type: "clean_text" }, { type: "summarize" }] });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Name is required");
    });

    it("returns 400 when name is empty string", async () => {
        const request = createPostRequest({
            name: "   ",
            steps: [{ type: "clean_text" }, { type: "summarize" }],
        });
        const response = await POST(request);

        expect(response.status).toBe(400);
    });

    it("returns 400 when steps count is less than minimum", async () => {
        const request = createPostRequest({
            name: "My Workflow",
            steps: [{ type: "clean_text" }],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("2-4 steps");
    });

    it("returns 400 when steps count exceeds maximum", async () => {
        const request = createPostRequest({
            name: "My Workflow",
            steps: [
                { type: "clean_text" },
                { type: "summarize" },
                { type: "extract_key_points" },
                { type: "tag_category" },
                { type: "clean_text" },
            ],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("2-4 steps");
    });

    it("returns 400 for invalid step type", async () => {
        const request = createPostRequest({
            name: "My Workflow",
            steps: [{ type: "clean_text" }, { type: "invalid_type" }],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid step type");
    });

    it("returns 201 with valid workflow", async () => {
        const request = createPostRequest({
            name: "My Test Workflow",
            description: "A test workflow",
            steps: [{ type: "clean_text" }, { type: "summarize" }],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.name).toBe("My Test Workflow");
        expect(data.steps).toHaveLength(2);
    });

    it("returns 400 when name exceeds maximum length", async () => {
        const request = createPostRequest({
            name: "A".repeat(101),
            steps: [{ type: "clean_text" }, { type: "summarize" }],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("characters or less");
    });
});
