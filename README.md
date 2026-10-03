# @neomaventures/mocks

Mocks of Express and NestJS framework types, for unit-testing guards, interceptors, filters, pipes and middleware without booting an application.

[![npm version](https://img.shields.io/npm/v/%40neomaventures%2Fmocks)](https://www.npmjs.com/package/@neomaventures/mocks)
[![CI](https://github.com/neomaventures/mocks/actions/workflows/ci.yml/badge.svg)](https://github.com/neomaventures/mocks/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Scope

Fakes of types this package does not own — Express's `Request` and `Response`,
NestJS's `ExecutionContext` and `CallHandler`. Anything that mocks a type from
one of your own packages belongs in that package's `/testing` subpath instead,
and anything that boots an application belongs in
[`@neomaventures/managed-app`](https://www.npmjs.com/package/@neomaventures/managed-app).

Custom Jest matchers live in
[`@neomaventures/matchers`](https://www.npmjs.com/package/@neomaventures/matchers).

## Installation

```bash
npm install --save-dev @neomaventures/mocks
```

### Peer dependencies

```bash
npm install --save-dev @nestjs/common @types/express rxjs
```

### Express mocks

```typescript
import { express } from '@neomaventures/mocks'
import type { MockRequest, MockResponse } from '@neomaventures/mocks'

// Create a request with randomized defaults
const req = express.request()

// Override specific properties
const customReq = express.request({
  method: 'POST',
  headers: { authorization: 'Bearer token' },
  body: { name: 'test' },
})

// Case-insensitive header access
req.get('Authorization')   // => 'Bearer token'
req.get('authorization')   // => 'Bearer token'
req.header('Authorization') // => 'Bearer token'

// Create a response with locals and headers
const res = express.response({
  locals: { user: { id: 'abc' } },
  headers: { 'Content-Type': 'text/html' },
})

// status() sets statusCode AND returns this for chaining
res.status(404).json({ error: 'Not found' })
expect(res.statusCode).toBe(404)
expect(res.json).toHaveBeenCalledWith({ error: 'Not found' })

// Mutable headers
res.setHeader('X-Custom', 'value')
res.getHeader('x-custom') // => 'value'

// Create a signed cookie (HMAC-SHA256, cookie-parser format)
const cookie = express.cookie('user123', 'my-secret')
const jsonCookie = express.cookie({ userId: 'abc' }, 'my-secret')
```

### NestJS ExecutionContext

```typescript
import { executionContext, express } from '@neomaventures/mocks'

// Minimal context (just switchToHttp)
const ctx = executionContext(req, res)
ctx.switchToHttp().getRequest()  // => req
ctx.switchToHttp().getResponse() // => res

// With bare handler function (for isolated guard testing)
const handler = (): void => {}
Reflect.defineMetadata('roles', ['admin'], handler)
const ctx = executionContext(req, res, handler)
ctx.getHandler() // => handler
ctx.getClass()   // => Object

// With custom class
const ctx = executionContext(req, res, handler, MyController)
ctx.getClass() // => MyController

// With typed route object (for integration-style testing)
const ctx = executionContext(req, res, {
  controller: UserController,
  method: 'findAll',
})
ctx.getHandler() // => UserController.prototype.findAll
ctx.getClass()   // => UserController
```


## License

MIT
