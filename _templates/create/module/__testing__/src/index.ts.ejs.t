---
to: modules/<%=name%>/__testing__/src/<%=name%>.test.ts
---

// import <%=h.changeCase.pascal(name)%>Action from "@axon-ai/<%=name%>-action-defs";
// import module from "@axon-ai/<%=name%>-module";
import { setUpTestEnvironment } from "@axon-ai/testing";
import { beforeAll, describe, expect, it } from "vitest";

describe("<%=h.changeCase.pascal(name)%> Tests", () => {
  beforeAll(async () => {
    await setUpTestEnvironment();
  }, 3000);

  it("should be defined", async () => {
   // const handler = module.getHandler(<%=h.changeCase.pascal(name)%>Action.)!;

   // expect(handler).toBeDefined();
  });
});
