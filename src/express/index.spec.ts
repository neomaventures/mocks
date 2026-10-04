import crypto from "crypto"

import { type MockRequest, express } from "./index"

describe("express", () => {
  describe("cookie", () => {
    it("should sign a string value with HMAC-SHA256", () => {
      const secret = "test-secret"
      const value = "user123"

      const result = express.cookie(value, secret)

      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(value)
        .digest("base64")
        .replace(/=+$/, "")

      expect(result).toBe(
        `${encodeURIComponent("s:")}${value}.${encodeURIComponent(expectedSig)}`,
      )
    })

    it("should sign an object value with j: prefix in the signed payload", () => {
      const secret = "test-secret"
      const value = { userId: "abc" }
      const jsonValue = JSON.stringify(value)
      const signedPayload = `j:${jsonValue}`

      const result = express.cookie(value, secret)

      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(signedPayload)
        .digest("base64")
        .replace(/=+$/, "")

      expect(result).toBe(
        `${encodeURIComponent("s:")}${signedPayload}.${encodeURIComponent(expectedSig)}`,
      )
    })

    it("should return an unsigned value when no secret is provided", () => {
      const result = express.cookie("user123")
      expect(result).toBe(`${encodeURIComponent("s:")}user123`)
    })
  })

  describe("request", () => {
    describe("case-insensitive header access via get()", () => {
      const req = express.request({
        headers: { authorization: "Bearer token" },
      })

      it("should return the header when queried with the canonical casing", () => {
        expect(req.get("Authorization")).toBe("Bearer token")
      })

      it("should return the header when queried with the lowercase casing", () => {
        expect(req.get("authorization")).toBe("Bearer token")
      })
    })

    it("should provide case-insensitive header access via header()", () => {
      const req = express.request({
        headers: { "content-type": "application/json" },
      })

      expect(req.header("Content-Type")).toBe("application/json")
    })

    it("should preserve extra properties passed via options", () => {
      const principal = { id: "user-1", roles: ["admin"] }
      const options: Partial<MockRequest> = { principal }
      const req = express.request(options)

      expect(req.principal).toBe(principal)
    })
  })

  describe("response", () => {
    describe("case-insensitive header access via get()", () => {
      const res = express.response({
        headers: { "Content-Type": "text/html" },
      })

      it("should return the header when queried with the lowercase casing", () => {
        expect(res.get("content-type")).toBe("text/html")
      })

      it("should return the header when queried with the canonical casing", () => {
        expect(res.get("Content-Type")).toBe("text/html")
      })
    })

    it("should support mutable headers via header() and get()", () => {
      const res = express.response()

      res.header("X-Custom", "value")
      expect(res.get("x-custom")).toBe("value")
    })

    it("should support mutable headers via setHeader() and getHeader()", () => {
      const res = express.response()

      res.setHeader("X-Custom", "value")
      expect(res.getHeader("x-custom")).toBe("value")
    })

    describe("append()", () => {
      describe("Given no existing header", () => {
        it("should set it", () => {
          const res = express.response()

          res.append("Set-Cookie", "a=1")

          expect(res.getHeader("set-cookie")).toBe("a=1")
        })
      })

      describe("Given a header already set", () => {
        it("should accumulate rather than replace, unlike setHeader", () => {
          const res = express.response()

          res.append("Set-Cookie", "a=1")
          res.append("Set-Cookie", "b=2")

          expect(res.getHeader("set-cookie")).toEqual(["a=1", "b=2"])
        })
      })

      describe("Given a spec asserting the call", () => {
        it("should record it like any other mock", () => {
          const res = express.response()

          res.append("Set-Cookie", "a=1")

          expect(res.append).toHaveBeenCalledWith("Set-Cookie", "a=1")
        })
      })
    })

    describe("status()", () => {
      const res = express.response()
      const returned = res.status(404)

      it("should set statusCode", () => {
        expect(res.statusCode).toBe(404)
      })

      it("should return the response for chaining", () => {
        expect(returned).toBe(res)
      })
    })
  })
})
