---
to: infrastructure/<%= name %>/src/<%= name %>/index.ts
---
export * from './__defs__';

export const <%=h.changeCase.camel(name) %> = {
}
