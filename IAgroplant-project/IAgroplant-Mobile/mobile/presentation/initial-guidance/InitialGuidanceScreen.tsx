import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { initialGuidanceService } from '../../application/services/initialGuidanceService';

type InitialGuidanceScreenProps = {
  navigation: any;
  route: {
    params?: {
      role?: string;
    };
  };
};

type GuidanceContent = {
  title: string;
  subtitle: string;
  firstAction: string;
  steps: string[];
  accent: string;
};

const DEFAULT_CONTENT: GuidanceContent = {
  title: 'Comece pelo seu painel',
  subtitle: 'Organize seu perfil e explore as ferramentas principais do IAgroplant.',
  firstAction: 'Abrir feed',
  accent: '#16A34A',
  steps: [
    'Complete seu perfil para receber recomendações melhores.',
    'Acompanhe publicações técnicas e oportunidades no feed.',
    'Use o diagnóstico por IA quando precisar analisar uma planta.',
  ],
};

function normalizeRole(role: string) {
  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getGuidanceContent(role?: string): GuidanceContent {
  const normalizedRole = normalizeRole(role || '');

  if (normalizedRole.includes('estudante')) {
    return {
      title: 'Seu ponto de partida como estudante',
      subtitle: 'Use o IAgroplant para aprender com casos reais e construir repertório técnico.',
      firstAction: 'Explorar o feed',
      accent: '#16A34A',
      steps: [
        'Veja publicações recentes para entender problemas comuns no campo.',
        'Salve dúvidas e converse com especialistas quando precisar de orientação.',
        'Use o diagnóstico por IA para comparar sintomas, causas e recomendações.',
      ],
    };
  }

  if (normalizedRole.includes('produtor')) {
    return {
      title: 'Seu ponto de partida como produtor',
      subtitle: 'Priorize diagnósticos, oportunidades e conexões que ajudem sua rotina no campo.',
      firstAction: 'Ir para diagnósticos',
      accent: '#B45309',
      steps: [
        'Use o botão de diagnóstico para registrar sintomas da lavoura.',
        'Acompanhe vagas, serviços e oportunidades próximas da sua região.',
        'Procure especialistas certificados para decisões que exigem apoio técnico.',
      ],
    };
  }

  if (
    normalizedRole.includes('agronomo') ||
    normalizedRole.includes('tecnico') ||
    normalizedRole.includes('técnico')
  ) {
    return {
      title: 'Seu ponto de partida técnico',
      subtitle: 'Ajude produtores, acompanhe casos e fortaleça sua reputação profissional.',
      firstAction: 'Buscar conexões',
      accent: '#2563EB',
      steps: [
        'Revise diagnósticos pendentes e contribua com recomendações úteis.',
        'Mantenha especialidades e região atualizadas no perfil.',
        'Use o chat para orientar produtores e tornar suas respostas reutilizáveis.',
      ],
    };
  }

  return DEFAULT_CONTENT;
}

export function InitialGuidanceScreen({ navigation, route }: InitialGuidanceScreenProps) {
  const role = route.params?.role;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const content = useMemo(() => getGuidanceContent(role), [role]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await initialGuidanceService.complete();
      navigation.replace('MainTabs', {
        startCoachMarks: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.badge, { borderColor: content.accent }]}>
          <Text style={[styles.badgeText, { color: content.accent }]}>Primeiro acesso</Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        <View style={styles.stepsList}>
          {content.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: content.accent }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          disabled={isSubmitting}
          onPress={handleFinish}
          style={[styles.primaryButton, { backgroundColor: content.accent }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{content.firstAction}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  stepsList: {
    marginTop: 34,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
