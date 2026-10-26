const API_URL = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Confirme se o FastAPI está ligado.");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Não foi possível concluir a operação.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(" ");
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function createUser(payload) {
  return request("/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createFinancialProfile(payload) {
  return request("/financial-profile/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getFinancialProfile(userId) {
  return request(`/financial-profile/${userId}`);
}

export function updateFinancialProfile(userId, payload) {
  return request(`/financial-profile/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createCategory(payload) {
  return request("/categories/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCategories(userId) {
  return request(`/categories/${userId}`);
}

export function updateCategory(categoryId, payload) {
  return request(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(categoryId) {
  return request(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function createEntry(payload) {
  return request("/entries/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getEntries(userId) {
  return request(`/entries/${userId}`);
}

export function updateEntry(entryId, payload) {
  return request(`/entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteEntry(entryId) {
  return request(`/entries/${entryId}`, {
    method: "DELETE",
  });
}
