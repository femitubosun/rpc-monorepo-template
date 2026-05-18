---
to: _templates/<%= name %>/<%= action || 'new' %>/prompt.ts
---

// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
export default [
  {
    type: 'input',
    name: 'message',
    message: "What's your message?"
  }
]
