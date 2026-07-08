import { PostFactory } from './PostFactory';
import { BasePost, SimplePost, DiagnosticPost, OpportunityPost } from '../../../domain/entities/post.entity';

// ─── SIMPLE POST FACTORY ──────────────────────────────────────────────────────

export class SimplePostFactory extends PostFactory {
  create(data: Omit<BasePost, 'type' | 'badge'>): SimplePost {
    return {
      ...data,
      type: 'simple',
      badge: null,
    };
  }
}

// ─── DIAGNOSTIC POST FACTORY ──────────────────────────────────────────────────

type DiagnosticInput = Omit<BasePost, 'type' | 'badge'> & {
  pathogen: string;
  severity: 'Baixa' | 'Moderada' | 'Alta';
};

export class DiagnosticPostFactory extends PostFactory {
  create(data: DiagnosticInput): DiagnosticPost {
    return {
      ...data,
      type: 'diagnostic',
      badge: {
        label: 'IA',
        icon: '🤖',
        color: '#7C3AED',
        bg: '#EDE9FE',
      },
      disclaimer:
        'Este resultado é auxiliar e não substitui laudo técnico profissional.',
    };
  }
}

// ─── OPPORTUNITY POST FACTORY ─────────────────────────────────────────────────

type OpportunityInput = Omit<BasePost, 'type' | 'badge'> & {
  salary: string;
  duration: string;
};

export class OpportunityPostFactory extends PostFactory {
  create(data: OpportunityInput): OpportunityPost {
    return {
      ...data,
      type: 'opportunity',
      badge: {
        label: 'Vaga',
        icon: '💼',
        color: '#065F46',
        bg: '#D1FAE5',
      },
    };
  }
}
