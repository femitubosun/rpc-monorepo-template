---
to: modules/<%=name%>/module/src/_module.ts
---
import { makeModule } from '@template/action';
import actionGroup from '@template/<%=name%>-action-defs';

const module = makeModule('<%=name%>', actionGroup);

export default module;
