---
to: modules/<%=name%>/__action__/src/index.ts
---
import { A, G } from '@axon-ai/action';
import z from 'zod';

const <%=h.changeCase.pascal(name)%>Action = G({

});

export default <%=h.changeCase.pascal(name)%>Action;
