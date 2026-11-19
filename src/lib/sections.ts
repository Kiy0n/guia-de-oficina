import {
  BookOpen,
  CalendarCheck,
  Calculator,
  ClipboardList,
  Clapperboard,
  PlayCircle,
  Stethoscope,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type SectionId =
  | 'ficha-tecnica'
  | 'iniciar-revisao'
  | 'manual-revisoes'
  | 'manuais-pdf'
  | 'procedimentos'
  | 'ferramentas'
  | 'eletrica'
  | 'diagnostico'
  | 'torques-calculadoras';

export interface SectionDef {
  id: SectionId;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
  /** Conteúdo previsto para as próximas fases (exibido nos placeholders). */
  previsto: string[];
}

export const SECTIONS: readonly SectionDef[] = [
  {
    id: 'ficha-tecnica',
    titulo: 'Ficha Técnica',
    descricao: 'Especificações de motor, fluidos, folgas, elétrica e pneus.',
    icon: ClipboardList,
    previsto: ['Fluidos e capacidades', 'Folgas de válvulas e cabos', 'Vela, bateria e fusíveis', 'Pneus e pressões'],
  },
  {
    id: 'iniciar-revisao',
    titulo: 'Iniciar Revisão',
    descricao: 'Modo guiado passo a passo com mapa visual HUD, critérios e relatório final.',
    icon: PlayCircle,
    previsto: ['Roteiro dinâmico por geração', 'Blueprint visual interativo', 'Relatório final para WhatsApp e impressão'],
  },
  {
    id: 'manual-revisoes',
    titulo: 'Manual de Revisões',
    descricao: 'Plano de manutenção preventiva por quilometragem e tempo.',
    icon: CalendarCheck,
    previsto: ['Tabela de revisões (km / meses)', 'Checklist por revisão', 'Próxima revisão pela quilometragem atual'],
  },
  {
    id: 'manuais-pdf',
    titulo: 'Manuais PDF',
    descricao: 'Biblioteca integrada de manuais de serviço e proprietário em PDF.',
    icon: BookOpen,
    previsto: ['Leitor PDF embutido na página', 'Busca automática em public/manuals/', 'Navegação rápida por página e tela cheia'],
  },
  {
    id: 'procedimentos',
    titulo: 'Procedimentos & Vídeos',
    descricao: 'Passo a passo de bancada com ferramentas, peças e vídeos.',
    icon: Clapperboard,
    previsto: ['Troca de óleo e filtros', 'Regulagem de válvulas', 'Kit relação e corrente', 'Pastilhas e lonas de freio'],
  },
  {
    id: 'ferramentas',
    titulo: 'Ferramentas',
    descricao: 'Lista de chaves, medidas e ferramentas necessárias para manutenção na bancada.',
    icon: Wrench,
    previsto: ['Chaves e soquetes por medida', 'Ferramentas especiais (sacadores, calibradores)', 'Consumíveis'],
  },
  {
    id: 'eletrica',
    titulo: 'Elétrica & Injeção',
    descricao: 'Diagramas, testes de componentes e sistema de injeção/carburação.',
    icon: Zap,
    previsto: ['Teste de estator e regulador', 'Sensores da injeção (TPS, MAP, IAT)', 'Códigos de falha / luz da injeção'],
  },
  {
    id: 'diagnostico',
    titulo: 'Diagnóstico Corretivo',
    descricao: 'Sintoma → causas prováveis → verificações e solução.',
    icon: Stethoscope,
    previsto: ['Não pega / falha em marcha lenta', 'Ruídos de motor e transmissão', 'Problemas de carga da bateria'],
  },
  {
    id: 'torques-calculadoras',
    titulo: 'Torques & Calculadoras',
    descricao: 'Tabela de torques específicos e universais e calculadoras de bancada.',
    icon: Calculator,
    previsto: ['Tabela de torques', 'Conversor de torque e calculadora 12V', 'Simulador de relação (coroa/pinhão)'],
  },
];

export const DEFAULT_SECTION: SectionId = 'ficha-tecnica';

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && SECTIONS.some((s) => s.id === value);
}
