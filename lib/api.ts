// lib/api.ts
export const apiFetch = <T = unknown>(path: string, options?: RequestInit): Promise<T> =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, options).then((res) =>
    res.json().then((data) => {
      if (!res.ok) throw data;
      return data as T;
    })
  );
