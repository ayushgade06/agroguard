const API_BASE_URL = "http://127.0.0.1:8000";


export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      Array.isArray(data.detail)
        ? data.detail[0].msg
        : data.detail || "Login failed";

    throw new Error(message);
  }

  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch("http://127.0.0.1:8000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}
