import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
// Usando a importação correta da store que o seu time de back já construiu
import { useSessionStore } from '@/app-shell/AppProviders'; 

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useSessionStore((s: any) => s.login); 

  const handleLogin = async () => {
    if (!email || password.length < 6) {
      setError('Preencha os dados corretamente (senha min. 6 caracteres).');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      // Usamos a variável err agora no console para resolver o erro do ESLint
      console.error('Erro no login:', err); 
      setError('Credenciais inválidas ou erro de rede.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center px-8 bg-background-main"
    >
      <View className="items-center mb-10" accessible={true}>
        <Text className="text-primary-dark font-poppinsBold text-5xl mb-2 tracking-tight">Linker</Text>
        <Text className="text-gray-500 font-poppins text-base text-center">
          O match perfeito entre talentos e vagas.
        </Text>
      </View>

      <View className="space-y-5">
        <TextInput
          className="w-full bg-white px-5 py-4 rounded-2xl font-poppins text-base border border-gray-100 focus:border-primary-light shadow-sm"
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          accessible={true}
          accessibilityLabel="Campo para digitar o e-mail"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          className="w-full bg-white px-5 py-4 rounded-2xl font-poppins text-base border border-gray-100 focus:border-primary-light shadow-sm"
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          accessible={true}
          accessibilityLabel="Campo para digitar a senha"
          value={password}
          onChangeText={setPassword}
        />

        {error ? (
          <Text className="text-red-500 font-poppins text-sm px-1" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity 
          className="w-full bg-primary py-4 rounded-2xl items-center mt-2 active:scale-[0.98] transition-transform shadow-md shadow-primary/30"
          onPress={handleLogin}
          disabled={isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Botão de Entrar"
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-poppinsBold text-lg">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-10">
        <Text className="text-gray-600 font-poppins">Ainda não tem conta? </Text>
        <Link href="/register" asChild>
          <TouchableOpacity activeOpacity={0.7} accessibilityRole="button">
            <Text className="text-primary font-poppinsBold">Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}