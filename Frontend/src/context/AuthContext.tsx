import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken, setOnSessaoExpirada } from "../services/api";
import {
  Usuario,
  PERFIS_ADMIN,
  login as loginApi,
  buscarUsuarioLogado,
  lerTokenSalvo,
  salvarToken,
  apagarToken,
} from "../services/auth/auth";

// O login ainda é opcional: sem sessão o app funciona como antes.
// Com sessão, o token vai em todas as chamadas e libera funções do perfil.

const CHAVE_USUARIO = "agapello_auth_usuario";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;        // restaurando a sessão salva ao abrir o app
  isAdmin: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(async () => {
    setAuthToken(null);
    setUsuario(null);
    await apagarToken();
    try {
      await SecureStore.deleteItemAsync(CHAVE_USUARIO);
    } catch {}
  }, []);

  // Token recusado pelo backend (expirou, foi inativado...) → sai
  useEffect(() => {
    setOnSessaoExpirada(() => { sair(); });
    return () => setOnSessaoExpirada(null);
  }, [sair]);

  // Restaura a sessão salva
  useEffect(() => {
    (async () => {
      const token = await lerTokenSalvo();
      if (!token) {
        setCarregando(false);
        return;
      }
      setAuthToken(token);

      // Mostra logo o usuário salvo (funciona sem internet / com o Render acordando)
      try {
        const salvo = await SecureStore.getItemAsync(CHAVE_USUARIO);
        if (salvo) setUsuario(JSON.parse(salvo));
      } catch {}
      setCarregando(false);

      // Confere com o backend; se o token for recusado, o onSessaoExpirada faz o logout
      try {
        const atual = await buscarUsuarioLogado();
        setUsuario(atual);
        await SecureStore.setItemAsync(CHAVE_USUARIO, JSON.stringify(atual));
      } catch {}
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await loginApi(email.trim().toLowerCase(), senha);
    setAuthToken(resposta.access_token);
    await salvarToken(resposta.access_token);
    await SecureStore.setItemAsync(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
    setUsuario(resposta.usuario);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    usuario,
    carregando,
    isAdmin: !!usuario && PERFIS_ADMIN.includes(usuario.perfil),
    entrar,
    sair,
  }), [usuario, carregando, entrar, sair]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
