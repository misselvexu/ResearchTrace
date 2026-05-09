/**
 * MSW handlers — User domain.
 */

import { http, HttpResponse } from "msw";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountResponse,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok } from "../fixtures/_shared";
import { SEED_PREFERENCES, SEED_USER, SEED_USER_PLAN } from "../fixtures/seeds";

const API = "/api/v1";

// In-memory mutable copies (reset on page reload).
let profile = { ...SEED_USER };
let preferences = { ...SEED_PREFERENCES };

export const userHandlers = [
  http.get(`${API}/user/me`, () => HttpResponse.json(ok(profile))),

  http.patch(`${API}/user/me`, async ({ request }) => {
    const body = (await request.json()) as UpdateProfileRequest;
    profile = {
      ...profile,
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      ...(body.bio !== undefined && { bio: body.bio }),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(profile));
  }),

  http.put(`${API}/user/me/preferences`, async ({ request }) => {
    const body = (await request.json()) as UpdatePreferencesRequest;
    preferences = { ...preferences, ...body };
    return HttpResponse.json(ok(preferences));
  }),

  http.get(`${API}/user/me/preferences`, () => HttpResponse.json(ok(preferences))),

  http.get(`${API}/user/me/plan`, () => HttpResponse.json(ok(SEED_USER_PLAN))),

  http.post(`${API}/user/me/change-password`, async ({ request }) => {
    const body = (await request.json()) as ChangePasswordRequest;
    if (!body.newPassword || body.newPassword.length < 8) {
      return HttpResponse.json(err(ErrorCode.AuthPasswordWeak, "Password too weak"), {
        status: 400,
      });
    }
    const payload: ChangePasswordResponse = null;
    return HttpResponse.json(ok(payload));
  }),

  http.delete(`${API}/user/me`, () => {
    const now = new Date();
    const purge = new Date(now);
    purge.setUTCDate(purge.getUTCDate() + 30);
    const payload: DeleteAccountResponse = {
      scheduledAt: now.toISOString(),
      purgeAt: purge.toISOString(),
    };
    return HttpResponse.json(ok(payload));
  }),
];
