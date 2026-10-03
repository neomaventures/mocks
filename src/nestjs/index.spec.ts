import { lastValueFrom } from "rxjs"

import { express } from "../express"

import { callHandler, executionContext } from "./index"

describe("executionContext", () => {
  describe("switchToHttp", () => {
    const req = express.request()
    const res = express.response()
    const ctx = executionContext(req, res)
    const http = ctx.switchToHttp!()

    it("should return the provided request from getRequest()", () => {
      expect(http.getRequest()).toBe(req)
    })

    it("should return the provided response from getResponse()", () => {
      expect(http.getResponse()).toBe(res)
    })
  })

  describe("Given no handler is provided", () => {
    const ctx = executionContext()

    it("should not include getHandler", () => {
      expect(ctx.getHandler).toBeUndefined()
    })

    it("should not include getClass", () => {
      expect(ctx.getClass).toBeUndefined()
    })
  })

  describe("Given a bare handler function and no class", () => {
    const handler = (): void => {}
    const ctx = executionContext(express.request(), undefined, handler)

    it("should resolve the handler function via getHandler()", () => {
      expect(ctx.getHandler!()).toBe(handler)
    })

    it("should default getClass() to Object", () => {
      expect(ctx.getClass!()).toBe(Object)
    })
  })

  describe("Given a bare handler function with a custom class", () => {
    const handler = (): void => {}
    class MyController {}

    const ctx = executionContext(
      express.request(),
      undefined,
      handler,
      MyController,
    )

    it("should resolve the handler function via getHandler()", () => {
      expect(ctx.getHandler!()).toBe(handler)
    })

    it("should resolve the provided class via getClass()", () => {
      expect(ctx.getClass!()).toBe(MyController)
    })
  })

  describe("Given a typed route object", () => {
    class UserController {
      public findAll(): void {}
    }

    const ctx = executionContext(express.request(), undefined, {
      controller: UserController,
      method: "findAll",
    })

    it("should resolve the method reference via getHandler()", () => {
      expect(ctx.getHandler!()).toBe(UserController.prototype.findAll)
    })

    it("should resolve the controller via getClass()", () => {
      expect(ctx.getClass!()).toBe(UserController)
    })
  })

  it("should default getType() to 'http'", () => {
    const ctx = executionContext()

    expect(ctx.getType!()).toBe("http")
  })

  it("should return the provided type from getType()", () => {
    const ctx = executionContext(
      express.request(),
      undefined,
      undefined,
      undefined,
      "rpc",
    )

    expect(ctx.getType!()).toBe("rpc")
  })
})

describe("callHandler", () => {
  it("should return the default value when no argument is provided", async () => {
    const next = callHandler()
    const result = await lastValueFrom(next.handle())

    expect(result).toEqual({ ok: true })
  })

  it("should return the provided value", async () => {
    const expected = { handled: true }
    const next = callHandler(expected)
    const result = await lastValueFrom(next.handle())

    expect(result).toEqual(expected)
  })
})
