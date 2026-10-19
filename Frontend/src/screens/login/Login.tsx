import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { authStyles as styles } from "./Login.styles";

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const senhaRef = useRef<TextInput>(null);

  const fechar = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const confirmar = async () => {
    if (!email.trim() || !senha) {
      Alert.alert("Atenção", "Informe o email e a senha.");
      return;
    }
    setEntrando(true);
    try {
      await entrar(email, senha);
      fechar();
    } catch (err: any) {
      Alert.alert("Não foi possível entrar", err?.message || "Tente novamente.");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.fechar} onPress={fechar} hitSlop={12}>
        <Text style={styles.fecharText}>✕</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require("../../../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.title}>Entrar no Agapello</Text>
          <Text style={styles.subtitle}>Use o email e a senha da sua conta</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaRow}>
            <TextInput
              ref={senhaRef}
              style={[styles.input, styles.senhaInput]}
              value={senha}
              onChangeText={setSenha}
              placeholder="Sua senha"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={confirmar}
            />
            <TouchableOpacity style={styles.mostrar} onPress={() => setMostrarSenha((v) => !v)}>
              <Text style={styles.mostrarText}>{mostrarSenha ? "Ocultar" : "Mostrar"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, entrando && styles.btnDisabled]}
            onPress={confirmar}
            disabled={entrando}
          >
            {entrando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.dica}>Esqueceu a senha? Fale com a coordenação.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
