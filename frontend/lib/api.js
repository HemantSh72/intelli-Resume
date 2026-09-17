import emailjs from '@emailjs/browser';

const DEFAULT_API_BASE = "http://localhost:8000/api/v1";

export function getApiBase() {
  if (typeof window !== "undefined" && window?.__API_BASE__) return window.__API_BASE__;
  return process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API_BASE;
}

async function handleResponse(res) {
  if (res.status === 204) return null;
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (typeof data === "string" ? data : data?.message || data?.error) ||
      (res.status === 409 ? "Already exists" : "Request failed");
    const err = new Error(message);
    if (res.status === 401) err.unauthorized = true;
    if (res.status === 409) err.conflict = true;
    if (res.status === 404) err.notFound = true;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function registerUser(payload) {
  const url = `${getApiBase()}/users/register`;
  const form = new URLSearchParams();
  if (payload.fullName) form.set("fullName", payload.fullName);
  if (payload.username) form.set("username", payload.username);
  if (payload.email) form.set("email", payload.email);
  if (payload.password) form.set("password", payload.password);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: form.toString(),
  });
  return handleResponse(res);
}

export async function loginUser(payload) {
  const base = getApiBase();
  const paths = ["/users/login", "/users/login/"];
  const form = new URLSearchParams();
  if (payload.email) form.set("email", payload.email);
  if (payload.username) form.set("username", payload.username);
  if (payload.password) form.set("password", payload.password);

  let lastRes = null;
  for (const path of paths) {
    const url = `${base}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: form.toString(),
    });
    if (res.ok) return handleResponse(res);
    if (res.status === 404) {
      lastRes = res;
      continue;
    }
    return handleResponse(res);
  }
  if (lastRes) return handleResponse(lastRes);
  throw new Error("Login failed: no route matched");
}

export async function logoutUser() {
  const res = await fetch(`${getApiBase()}/users/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function updateAccount({ fullName, username }) {
  const base = getApiBase();
  const form = new URLSearchParams();
  if (fullName) form.set("fullName", fullName);
  if (username) form.set("username", username);

  let res = await fetch(`${base}/users/update-info`, {
    method: "PATCH",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: form.toString(),
  });

  if (res.status === 404) {
    res = await fetch(`${base}/users/update-account`, {
      method: "PATCH",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: form.toString(),
    });
  }
  return handleResponse(res);
}

export async function updatePassword({ oldPassword, newPassword }) {
  const form = new URLSearchParams();
  if (oldPassword) form.set("oldPassword", oldPassword);
  if (newPassword) form.set("newPassword", newPassword);

  const res = await fetch(`${getApiBase()}/users/update-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: form.toString(),
  });
  return handleResponse(res);
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await fetch(`${getApiBase()}/users/resume`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  return handleResponse(res);
}

export async function analyzeResume(jobDescription) {
  const res = await fetch(`${getApiBase()}/ai/analyze-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ jobDescription }),
  });
  return handleResponse(res);
}

/*=============== CONTACT FORM FUNCTIONALITY ===============*/
export const handleContactSubmit = (e, formElement) => {
  e.preventDefault();
  
  emailjs.init({
    publicKey: "jBM1ZtoreCCVk5uMh",
  });

  const serviceID = 'service_ziabsku';
  const templateID = 'template_xmgz6xp';

  return emailjs.sendForm(serviceID, templateID, formElement);
};