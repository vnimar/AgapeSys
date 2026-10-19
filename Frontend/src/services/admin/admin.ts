import * as SecureStore from "expo-secure-store";
import { apiRequest } from "../api";

// Modo de edição protegido por PIN enquanto o login não existe.
// O PIN é validado no backend e guardado com segurança no aparelho.

const CHAVE_PIN = "agapello_admin_pin";

export async function getAdminPin(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CHAVE_PIN);
  } catch {
    return null;
  }
}

export async function entrarModoEdicao(pin: string): Promise<void> {
  await apiRequest("/missao/admin/verificar-pin", {
    method: "POST",
    headers: { "X-Admin-Pin": pin },
  });
  await SecureStore.setItemAsync(CHAVE_PIN, pin);
}

export async function sairModoEdicao(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_PIN);
}

/**
 * Headers para chamadas de administração. Com login de administrador o token já
 * vai pelo api.ts; o PIN só é enviado se estiver salvo.
 */
export async function adminHeaders(): Promise<Record<string, string>> {
  const pin = await getAdminPin();
  return pin ? { "X-Admin-Pin": pin } : {};
}
