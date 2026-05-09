/**
 * MSW handlers — Auth domain.
 *
 * Mock implementations of /auth/* endpoints. The mocks accept any
 * email/password combo (except `error@*` which simulates failure)
 * and return realistic AuthTokens.
 */

import { http, HttpResponse } from "msw";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OAuthExchangeRequest,
  OAuthExchangeResponse,
  RefreshResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok } from "../fixtures/_shared";
import { SEED_USER } from "../fixtures/seeds";

const API = "/api/v1";

const TOKENS = {
  accessToken: "mock_access_eyJhbGciOiJIUzI1NiJ9.demo.signature",
  expiresIn: 900,
  tokenType: "Bearer" as const,
};

export const authHandlers = [
  // ---- POST /auth/signup ---------------------------------------------------
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as SignupRequest;
    if (body.email === "taken@researchtrace.com") {
      return HttpResponse.json(err(ErrorCode.AuthEmailTaken, "Email already registered"), {
        status: 409,
      });
    }
    if (!body.password || body.password.length < 8) {
      return HttpResponse.json(err(ErrorCode.AuthPasswordWeak, "Password too weak"), {
        status: 400,
      });
    }
    const payload: SignupResponse = {
      userId: SEED_USER.id,
      emailVerificationSent: true,
      tokens: TOKENS,
    };
    return HttpResponse.json(ok(payload));
  }),

  // ---- POST /auth/login ----------------------------------------------------
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    if (body.email.startsWith("error@")) {
      return HttpResponse.json(
        err(ErrorCode.AuthInvalidCredentials, "Invalid credentials"),
        { status: 401 },
      );
    }
    const payload: LoginResponse = {
      userId: SEED_USER.id,
      tokens: TOKENS,
      emailVerified: true,
    };
    return HttpResponse.json(ok(payload), {
      headers: {
        "Set-Cookie":
          "rt-refresh=mock_refresh_token; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000",
      },
    });
  }),

  // ---- POST /auth/refresh --------------------------------------------------
  http.post(`${API}/auth/refresh`, () => {
    const payload: RefreshResponse = TOKENS;
    return HttpResponse.json(ok(payload));
  }),

  // ---- POST /auth/logout ---------------------------------------------------
  http.post(`${API}/auth/logout`, () => {
    const payload: LogoutResponse = null;
    return HttpResponse.json(ok(payload), {
      headers: { "Set-Cookie": "rt-refresh=; Path=/; Max-Age=0" },
    });
  }),

  // ---- POST /auth/verify-email --------------------------------------------
  http.post(`${API}/auth/verify-email`, async ({ request }) => {
    const body = (await request.json()) as VerifyEmailRequest;
    if (!body.token) {
      return HttpResponse.json(err(ErrorCode.AuthTokenInvalid, "Invalid token"), {
        status: 400,
      });
    }
    const payload: VerifyEmailResponse = { userId: SEED_USER.id, emailVerified: true };
    return HttpResponse.json(ok(payload));
  }),

  // ---- POST /auth/forgot-password -----------------------------------------
  http.post(`${API}/auth/forgot-password`, async ({ request }) => {
    await (request.json() as Promise<ForgotPasswordRequest>);
    const payload: ForgotPasswordResponse = { delivered: true };
    return HttpResponse.json(ok(payload));
  }),

  // ---- POST /auth/reset-password ------------------------------------------
  http.post(`${API}/auth/reset-password`, async ({ request }) => {
    const body = (await request.json()) as ResetPasswordRequest;
    if (!body.newPassword || body.newPassword.length < 8) {
      return HttpResponse.json(err(ErrorCode.AuthPasswordWeak, "Password too weak"), {
        status: 400,
      });
    }
    const payload: ResetPasswordResponse = { userId: SEED_USER.id };
    return HttpResponse.json(ok(payload));
  }),

  // ---- POST /auth/oauth/exchange ------------------------------------------
  http.post(`${API}/auth/oauth/exchange`, async ({ request }) => {
    const body = (await request.json()) as OAuthExchangeRequest;
    if (!body.handoff) {
      return HttpResponse.json(err(ErrorCode.AuthOAuthFailed, "Missing handoff"), {
        status: 400,
      });
    }
    const payload: OAuthExchangeResponse = {
      userId: SEED_USER.id,
      tokens: TOKENS,
      emailVerified: true,
      isNewUser: false,
    };
    return HttpResponse.json(ok(payload));
  }),
];
