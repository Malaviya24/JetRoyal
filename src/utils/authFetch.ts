// Small wrapper around fetch that detects expired/invalid JWT tokens and
// signs the user out cleanly. Use this for any user-authenticated API call.
//
// If the server returns 401:
//   - localStorage token is cleared
//   - user is redirected to /login
//   - the original promise rejects so callers don't try to parse JSON
//
// All other responses are returned untouched.

import { toast } from "react-toastify";

let alreadyHandling = false;

export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    if (!alreadyHandling) {
      alreadyHandling = true;
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }
    throw new Error("Unauthorized");
  }
  return res;
}
