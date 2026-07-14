import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TooltipProps, useCopilot } from 'react-native-copilot';

export function CoachMarksTooltip({ labels }: TooltipProps) {
  const {
    currentStep,
    currentStepNumber,
    totalStepsNumber,
    isLastStep,
    goToNext,
    stop,
  } = useCopilot();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Guia rápido</Text>
        <Text style={styles.counter}>
          {currentStepNumber}/{totalStepsNumber}
        </Text>
      </View>

      <Text style={styles.text}>{currentStep?.text}</Text>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.8} onPress={stop} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>{labels.skip || 'Pular'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={isLastStep ? stop : goToNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? labels.finish || 'Concluir' : labels.next || 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  counter: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  text: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
  },
  nextButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
