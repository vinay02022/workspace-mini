import { GET } from "@/app/api/status/route";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

// Mock gemini
jest.mock("@/lib/gemini", () => ({
  isLlmAvailable: jest.fn().mockReturnValue(false),
}));

describe("GET /api/status", () => {
  it("returns status with backend ok", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.backend.status).toBe("ok");
  });

  it("returns database status ok when connected", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.database.status).toBe("ok");
  });

  it("returns llm unavailable when no api key", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.llm.status).toBe("unavailable");
    expect(data.llm.message).toContain("No API key");
  });

  it("returns llm ok when api key is set", async () => {
    const { isLlmAvailable } = require("@/lib/gemini");
    (isLlmAvailable as jest.Mock).mockReturnValue(true);

    const response = await GET();
    const data = await response.json();

    expect(data.llm.status).toBe("ok");
    expect(data.llm.message).toContain("configured");
  });
});
