import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList, SafeAreaView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import ConfirmModal from '../components/ConfirmModal';
import { useSettings } from '../contexts/SettingsContext';
import { useGame } from '../contexts/GameContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import { Difficulty, GameMode, GameRecord } from '../types/types';
import { clearAll } from '../utils/storage';

const MODE_LABELS: Record<GameMode, string> = {
  [GameMode.Clasico]: 'Clásico',
  [GameMode.VerdaderoFalso]: 'V/F',
  [GameMode.MultipleChoice]: 'MC',
  [GameMode.ContraReloj]: 'Reloj',
};

const DIFF_LABELS: Record<Difficulty, string> = {
  [Difficulty.Facil]: 'Fácil',
  [Difficulty.Medio]: 'Medio',
  [Difficulty.Dificil]: 'Difícil',
};

export default function HistoryScreen() {
  const nav = useNavigation();
  const { theme, settings } = useSettings();
  const { state, dispatch } = useGame();

  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = state.history.filter(r => {
    if (filterMode !== 'all' && r.mode !== filterMode) return false;
    if (filterDiff !== 'all' && r.difficulty !== filterDiff) return false;
    return true;
  });

  async function handleClear() {
    await clearAll();
    dispatch({ type: 'CLEAR_ALL' });
    setShowConfirm(false);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function renderItem({ item }: { item: GameRecord }) {
    const isPositive = item.score >= 0;
    return (
      <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.itemLeft}>
          <Text style={[styles.itemMode, { color: theme.textPrimary }]}>
            {MODE_LABELS[item.mode]} · {DIFF_LABELS[item.difficulty]}
          </Text>
          <Text style={[styles.itemDate, { color: theme.textMuted }]}>{formatDate(item.date)}</Text>
          <Text style={[styles.itemStats, { color: theme.textSecondary }]}>
            {item.correct}✓ {item.incorrect}✗ {item.timeouts}⏱ · {item.accuracy}%
          </Text>
        </View>
        <Text style={[styles.itemScore, { color: isPositive ? theme.success : theme.error }]}>
          {isPositive ? '+' : ''}{item.score}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={[styles.back, { color: theme.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Historial</Text>
        <TouchableOpacity onPress={() => setShowConfirm(true)}>
          <Text style={[styles.clearBtn, { color: theme.error }]}>Borrar</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollChips
          options={['all', ...Object.values(GameMode)]}
          selected={filterMode}
          onSelect={(v) => setFilterMode(v as GameMode | 'all')}
          labels={{ all: 'Todos', ...MODE_LABELS }}
          theme={theme}
        />
        <ScrollChips
          options={['all', ...Object.values(Difficulty)]}
          selected={filterDiff}
          onSelect={(v) => setFilterDiff(v as Difficulty | 'all')}
          labels={{ all: 'Todas', ...DIFF_LABELS }}
          theme={theme}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>Sin partidas registradas</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmModal
        visible={showConfirm}
        title="Borrar historial"
        message="Se eliminarán todas las partidas y récords. No se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={handleClear}
        onCancel={() => setShowConfirm(false)}
        destructive
      />
    </SafeAreaView>
  );
}

interface ScrollChipsProps {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  labels: Record<string, string>;
  theme: any;
}

function ScrollChips({ options, selected, onSelect, labels, theme }: ScrollChipsProps) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt: string) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={[
            styles.chip,
            {
              backgroundColor: selected === opt ? theme.primary : theme.surface,
              borderColor: selected === opt ? theme.primary : theme.border,
            },
          ]}
        >
          <Text style={{ color: selected === opt ? '#FFF' : theme.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' }}>
            {labels[opt]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  back: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  clearBtn: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  filters: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
  },
  list: { padding: SPACING.lg, gap: SPACING.sm },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1,
  },
  itemLeft: { flex: 1, gap: 2 },
  itemMode: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  itemDate: { fontSize: FONT_SIZES.xs },
  itemStats: { fontSize: FONT_SIZES.sm },
  itemScore: { fontSize: FONT_SIZES.xl, fontWeight: '800', marginLeft: SPACING.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FONT_SIZES.md },
});
