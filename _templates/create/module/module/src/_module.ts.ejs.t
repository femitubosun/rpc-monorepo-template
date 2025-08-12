---
to: modules/<%=name%>/module/src/_module.ts
---
import { makeModule } from '@axon-ai/action';
import actionGroup from '@axon-ai/<%=name%>-action-defs';

const module = makeModule('<%=name%>', actionGroup);

export default module;
