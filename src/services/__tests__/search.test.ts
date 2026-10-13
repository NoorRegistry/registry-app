import { http } from "@/api/http";
import { fetchSearchResults } from "../search.service";

jest.mock("@/api/http", () => ({ http: { get: jest.fn() } }));
it("passes punctuation in search as query data instead of concatenating a URL", async () => {
  await fetchSearchResults("H&M + gifts#1");
  expect(http.get).toHaveBeenCalledWith("/v1/api/users/search", {
    params: { search: "H&M + gifts#1", type: "all", page: 1, limit: 20 },
    signal: undefined,
  });
});
