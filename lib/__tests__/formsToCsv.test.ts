import { formsToCsv } from "../csv";
import type { Form } from "../types";

describe("formsToCsv", () => {
  it("serializes forms to CSV with header", () => {
    const forms: Form[] = [
      {
        id: "1",
        title: "Customer Feedback",
        description: "Short survey",
        fieldsCount: 5,
        status: "active",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
      },
    ];

    const csv = formsToCsv(forms);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("id,title,description,fieldsCount,status,updatedAt");
    expect(lines[1]).toBe(
      '1,Customer Feedback,Short survey,5,active,2025-01-02',
    );
  });

  it("escapes quotes and commas in values", () => {
    const forms: Form[] = [
      {
        id: "2",
        title: 'Title, with "quotes"',
        description: "Desc, with comma",
        fieldsCount: 3,
        status: "draft",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
      },
    ];

    const csv = formsToCsv(forms);
    const [, dataLine] = csv.split("\n");

    expect(dataLine).toBe(
      '2,"Title, with ""quotes""","Desc, with comma",3,draft,2025-01-02',
    );
  });
});

