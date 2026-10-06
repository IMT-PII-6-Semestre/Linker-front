import { MaterialIcons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppFonts, AppRadius, AppShadows, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';

import { formatCompact, formatInteger, formatPercent } from '../domain/metrics';

/*
 * Peças do painel, seguindo o método de data-viz:
 * - forma antes da cor (número de destaque, KPIs, medidor, barra de
 *   composição e colunas — nada de pizza);
 * - cores de dado = papéis validados do tema (dataSeries1/2, dataTrack);
 * - texto sempre nas cores de texto, nunca na cor da série;
 * - hover/foco com área de toque maior que a marca, e toda informação
 *   também acessível sem hover (rótulo direto seletivo + tabela).
 */

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface PanelCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Conteúdo alternativo em tabela (botão "Ver tabela"). */
  table?: ReactNode;
  testID?: string;
}

export function PanelCard({ title, subtitle, children, table, testID }: PanelCardProps) {
  const colors = useAppTheme();
  const [showTable, setShowTable] = useState(false);

  return (
    <View testID={testID} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="label" color="onSurfaceVariant">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {table ? (
          <Pressable
            testID={testID ? `${testID}-toggle-table` : undefined}
            accessibilityRole="button"
            accessibilityLabel={
              showTable ? `Ver ${title} como gráfico` : `Ver ${title} como tabela`
            }
            onPress={() => setShowTable((v) => !v)}
            style={({ pressed }) => [
              styles.toggle,
              { backgroundColor: pressed ? colors.surfaceVariant : 'transparent' },
            ]}
          >
            <MaterialIcons
              name={showTable ? 'bar-chart' : 'table-rows'}
              size={16}
              color={colors.primary}
            />
            <AppText variant="caption" color="primary">
              {showTable ? 'Ver gráfico' : 'Ver tabela'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {showTable && table ? table : children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Número de destaque e KPIs
// ---------------------------------------------------------------------------

interface DeltaProps {
  /** Fração (0,12 = +12%). */
  value: number;
  period: string;
}

/** Variação com sinal, seta e período nomeado — nunca só a cor. */
export function Delta({ value, period }: DeltaProps) {
  const colors = useAppTheme();
  const up = value > 0;
  const flat = value === 0;
  const color = flat ? colors.onSurfaceVariant : up ? colors.success : colors.error;
  const sign = flat ? '' : up ? '+' : '−';
  return (
    <View style={styles.delta}>
      <MaterialIcons
        name={flat ? 'trending-flat' : up ? 'trending-up' : 'trending-down'}
        size={18}
        color={color}
      />
      <AppText variant="bodyStrong" style={{ color }}>
        {sign}
        {formatPercent(Math.abs(value))}
      </AppText>
      <AppText variant="label" color="onSurfaceVariant">
        {period}
      </AppText>
    </View>
  );
}

export function HeroFigure({
  label,
  value,
  children,
}: {
  label: string;
  value: number;
  children?: ReactNode;
}) {
  return (
    <View
      style={styles.hero}
      accessible
      accessibilityLabel={`${label}: ${formatInteger(value)}`}
      testID="hero-total-usuarios"
    >
      <AppText variant="bodyStrong" color="onSurfaceVariant">
        {label}
      </AppText>
      <AppText style={styles.heroValue}>{formatInteger(value)}</AppText>
      {children}
    </View>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  /** Explicação curta abaixo do valor. */
  hint?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  testID?: string;
}

export function StatTile({ label, value, hint, icon, testID }: StatTileProps) {
  const colors = useAppTheme();
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `. ${hint}` : ''}`}
      style={[styles.card, styles.tile, { backgroundColor: colors.surface }]}
    >
      <View style={styles.tileTop}>
        <AppText variant="label" color="onSurfaceVariant" style={styles.flex}>
          {label}
        </AppText>
        <View style={[styles.tileIcon, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name={icon} size={18} color={colors.onPrimaryContainer} />
        </View>
      </View>
      <AppText style={styles.tileValue}>{value}</AppText>
      {hint ? (
        <AppText variant="label" color="onSurfaceVariant">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Medidor (razão contra 100%)
// ---------------------------------------------------------------------------

export function Meter({ fraction, caption }: { fraction: number; caption: string }) {
  const colors = useAppTheme();
  const pct = Math.max(0, Math.min(1, fraction));
  return (
    <View
      style={styles.meterWrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${formatPercent(pct)}. ${caption}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <AppText style={styles.meterValue}>{formatPercent(pct)}</AppText>
      <View style={[styles.meterTrack, { backgroundColor: colors.dataTrack }]}>
        <View
          style={[
            styles.meterFill,
            { width: `${pct * 100}%`, backgroundColor: colors.dataSeries1 },
          ]}
        />
      </View>
      <AppText variant="label" color="onSurfaceVariant">
        {caption}
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Composição (parte do todo) — barra empilhada horizontal, 2 categorias
// ---------------------------------------------------------------------------

interface ShareSegment {
  label: string;
  amount: number;
  color: string;
}

export function ShareBar({ segments }: { segments: [ShareSegment, ShareSegment] }) {
  const colors = useAppTheme();
  const total = segments.reduce((a, s) => a + s.amount, 0) || 1;
  return (
    <View style={styles.shareWrap}>
      {/* 2px de superfície entre os segmentos — separa sem borda. */}
      <View
        style={[styles.shareBar, { gap: 2, backgroundColor: colors.surface }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {segments.map((s, i) => (
          <View
            key={s.label}
            style={{
              flex: s.amount,
              backgroundColor: s.color,
              borderTopLeftRadius: i === 0 ? 4 : 0,
              borderBottomLeftRadius: i === 0 ? 4 : 0,
              borderTopRightRadius: i === segments.length - 1 ? 4 : 0,
              borderBottomRightRadius: i === segments.length - 1 ? 4 : 0,
            }}
          />
        ))}
      </View>
      {/* Legenda com rótulo direto (valor + %), texto nas cores de texto. */}
      <View style={styles.legend}>
        {segments.map((s) => (
          <View
            key={s.label}
            style={styles.legendItem}
            accessible
            accessibilityLabel={`${s.label}: ${formatInteger(s.amount)}, ${formatPercent(s.amount / total)}`}
          >
            <View style={[styles.swatch, { backgroundColor: s.color }]} />
            <View>
              <AppText variant="label" color="onSurfaceVariant">
                {s.label}
              </AppText>
              <AppText variant="bodyStrong">
                {formatInteger(s.amount)}{' '}
                <AppText variant="label" color="onSurfaceVariant">
                  ({formatPercent(s.amount / total)})
                </AppText>
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Colunas (magnitude, uma cor só)
// ---------------------------------------------------------------------------

interface ColumnDatum {
  label: string;
  /** `amount`, não `value`: o plugin do Reanimated confunde `.value` em estilo com shared value. */
  amount: number;
}

interface ColumnChartProps {
  data: ColumnDatum[];
  /** Nome da medida no tooltip/leitor de tela ("matches", "candidatos"). */
  unit: string;
  /** Índice com rótulo direto (o resto fica no tooltip/tabela). */
  labelIndex?: number;
  height?: number;
  testID?: string;
}

const PLOT_HEIGHT = 160;

/** "Teto" arredondado do eixo: 319 → 400, 1.084 → 1.200. */
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = magnitude / 2;
  return Math.ceil(max / step) * step;
}

export function ColumnChart({
  data,
  unit,
  labelIndex,
  height = PLOT_HEIGHT,
  testID,
}: ColumnChartProps) {
  const colors = useAppTheme();
  const [active, setActive] = useState<number | null>(null);
  const top = niceMax(Math.max(...data.map((d) => d.amount)));
  const ticks = [top, top / 2, 0];

  return (
    <View testID={testID} style={styles.columnWrap}>
      <View style={[styles.plotRow, { height }]}>
        {/* Eixo Y recessivo: 3 marcas, linhas sólidas e finas. */}
        <View style={styles.yAxis}>
          {ticks.map((t) => (
            <AppText key={t} variant="label" color="onSurfaceVariant" style={styles.tick}>
              {formatCompact(t)}
            </AppText>
          ))}
        </View>
        <View style={styles.plot}>
          {ticks.map((t, i) => (
            <View
              key={t}
              style={[
                styles.gridline,
                {
                  top: `${(i / (ticks.length - 1)) * 100}%`,
                  backgroundColor:
                    i === ticks.length - 1 ? colors.outline : colors.surfaceContainerHighest,
                },
              ]}
            />
          ))}
          <View style={styles.columns}>
            {data.map((d, i) => {
              const isActive = active === i;
              const showLabel = isActive || i === labelIndex;
              return (
                // A área de hover/foco é a coluna inteira, não só a barra.
                <Pressable
                  key={d.label}
                  testID={testID ? `${testID}-col-${i}` : undefined}
                  accessibilityRole="text"
                  accessibilityLabel={`${d.label}: ${formatInteger(d.amount)} ${unit}`}
                  onHoverIn={() => setActive(i)}
                  onHoverOut={() => setActive((a) => (a === i ? null : a))}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive((a) => (a === i ? null : a))}
                  onPress={() => setActive((a) => (a === i ? null : i))}
                  style={styles.slot}
                >
                  {showLabel ? (
                    <View
                      style={[
                        styles.valueLabel,
                        isActive && [styles.tooltip, { backgroundColor: colors.onSurface }],
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{ color: isActive ? colors.surface : colors.onSurface }}
                      >
                        {formatInteger(d.amount)}
                        {isActive ? ` ${unit}` : ''}
                      </AppText>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(d.amount / top) * 100}%`,
                        backgroundColor: colors.dataSeries1,
                        opacity: active == null || isActive ? 1 : 0.55,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.xAxis}>
        {data.map((d) => (
          <AppText
            key={d.label}
            variant="label"
            color="onSurfaceVariant"
            align="center"
            style={styles.xLabel}
            numberOfLines={1}
          >
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tabela (alternativa acessível aos gráficos)
// ---------------------------------------------------------------------------

export function DataTable({
  columns,
  rows,
}: {
  columns: [string, string];
  rows: [string, string][];
}) {
  const colors = useAppTheme();
  return (
    <View accessibilityRole="list">
      <View style={[styles.tableRow, { borderBottomColor: colors.outlineVariant }]}>
        {columns.map((c, i) => (
          <AppText
            key={c}
            variant="caption"
            color="onSurfaceVariant"
            style={[styles.flex, i === 1 && styles.numeric]}
          >
            {c}
          </AppText>
        ))}
      </View>
      {rows.map(([a, b]) => (
        <View
          key={a}
          style={[styles.tableRow, { borderBottomColor: colors.surfaceContainerHighest }]}
          accessible
          accessibilityLabel={`${a}: ${b}`}
        >
          <AppText style={styles.flex}>{a}</AppText>
          <AppText style={[styles.flex, styles.numeric]}>{b}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    borderRadius: AppRadius.matchCard,
    padding: AppSpacing.lg,
    gap: AppSpacing.md,
    ...AppShadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppSpacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: AppSpacing.sm,
    borderRadius: 8,
  },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  hero: {
    gap: 2,
  },
  heroValue: {
    fontFamily: AppFonts.bold,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  tile: {
    flex: 1,
    gap: AppSpacing.xs,
    padding: AppSpacing.md,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileValue: {
    fontFamily: AppFonts.semibold,
    fontSize: 28,
    lineHeight: 36,
  },
  meterWrap: {
    gap: AppSpacing.sm,
  },
  meterValue: {
    fontFamily: AppFonts.semibold,
    fontSize: 28,
    lineHeight: 36,
  },
  meterTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  shareWrap: {
    gap: AppSpacing.md,
  },
  shareBar: {
    flexDirection: 'row',
    height: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  columnWrap: {
    gap: AppSpacing.xs,
  },
  plotRow: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: AppSpacing.xs,
  },
  tick: {
    textAlign: 'right',
    fontSize: 10,
    lineHeight: 12,
    marginVertical: -6,
  },
  plot: {
    flex: 1,
  },
  gridline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  slot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '62%',
    maxWidth: 40,
    minHeight: 2,
    // Ponta de dado arredondada (4px), ancorada na base.
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  valueLabel: {
    marginBottom: 4,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xAxis: {
    flexDirection: 'row',
    marginLeft: 40,
    gap: 2,
  },
  xLabel: {
    flex: 1,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: AppSpacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numeric: {
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
