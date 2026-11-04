export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const PIN_KEY = 'tbh-pin';

function readPin(): string {
  try {
    return localStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
}

function savePin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin);
    else localStorage.removeItem(PIN_KEY);
  } catch {
    /* almacenamiento no disponible (algunas Smart TV) */
  }
}

/** POST JSON al backend. Si el servidor pide PIN, lo solicita una vez y lo recuerda. */
export async function post(url: string, body: unknown): Promise<void> {
  const send = () => {
    const pin = readPin();
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(pin ? { 'x-tbh-pin': pin } : {}) },
      body: JSON.stringify(body)
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch {
    throw new ApiError(0, 'Sin conexión con el servidor');
  }

  if (res.status === 401) {
    const entered = window.prompt('PIN de control de TBH');
    if (!entered) throw new ApiError(401, 'Se necesita el PIN para editar');
    savePin(entered);
    res = await send();
    if (res.status === 401) {
      savePin(null);
      throw new ApiError(401, 'PIN incorrecto');
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as { error?: string }).error || `Error ${res.status}`);
  }
}
