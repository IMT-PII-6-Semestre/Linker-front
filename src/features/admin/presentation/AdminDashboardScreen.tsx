import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminStore, useAdminStoreApi, useSessionStore } from '@/app-shell/AppProviders';
import { AppFonts, AppShadows, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { formatTime } from '@/features/chat/domain/chat';

import { formatDecimal, formatInteger, formatPercent, type AdminMetrics } from '../domain/metrics';

import {
  ColumnChart,
  DataTable,
  Delta,
  HeroFigure,
  Meter,
  PanelCard,
  ShareBar,
  StatTile,
} from './charts';

/**
 * Página 6 — painel administrativo (web). Métricas da plataforma:
 * usuários, empregados, empregadores, matches, % de indicações que viraram
 * match, média de vagas por empresa e média de idade.
 */
export function AdminDashboardScreen() {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const signOut = useSessionStore((s) => s.signOut);
  const status = useAdminStore((s) => s.status);
  const metrics = useAdminStore((s) => s.metrics);
  const failure = useAdminStore((s) => s.failure);
  const refreshing = useAdminStore((s) => s.refreshing);
  const { load } = useAdminStoreApi().getState();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (session?.role === 'admin') void load(session);
  }, [session, load]);

  if (!session) return null;

  const columns = width >= 1100 ? 4 : width >= 700 ? 2 : 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface }]}>
        <View style={[styles.topBarInner, styles.container]}>
          <AppLogo size={26} />
          <AppText
            variant="bodyStrong"
            color="onSurfaceVariant"
            style={styles.flex}
            numberOfLines={1}
          >
            Painel administrativo
          </AppText>
          {session.role === 'admin' && metrics ? (
            <AppText variant="label" color="onSurfaceVariant" accessibilityLiveRegion="polite">
              {refreshing ? 'Atualizando…' : `Atualizado às ${formatTime(metrics.geradoEm)}`}
            </AppText>
          ) : null}
          {session.role === 'admin' ? (
            <Button
              testID="admin-refresh"
              label="Atualizar"
              icon="refresh"
              variant="ghost"
              loading={refreshing}
              onPress={() => void load(session)}
            />
          ) : null}
          <Button
            testID="logout-button"
            label="Sair"
            icon="logout"
            variant="outline"
            onPress={() => void signOut()}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          {session.role !== 'admin' ? (
            <AccessDenied />
          ) : status === 'loading' && !metrics ? (
            <ActivityIndicator
              style={styles.loading}
              size="large"
              color={colors.primary}
              accessibilityLabel="Carregando métricas"
            />
          ) : !metrics ? (
            <View style={styles.centered}>
              {failure ? <FailureBanner failure={failure} /> : null}
              <Button label="Tentar novamente" onPress={() => void load(session)} />
            </View>
          ) : (
            <Dashboard
              metrics={metrics}
              columns={columns}
              refreshFailed={status === 'error' ? failure?.message : undefined}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dashboard({
  metrics: m,
  columns,
  refreshFailed,
}: {
  metrics: AdminMetrics;
  columns: number;
  refreshFailed?: string;
}) {
  const colors = useAppTheme();
  const lastWeek = m.matchesPorSemana.length - 1;

  return (
    <View style={styles.sections}>
      {refreshFailed ? (
        <FailureBanner
          failure={{ type: 'unexpected', message: `Não foi possível atualizar: ${refreshFailed}` }}
        />
      ) : null}

      {/* Número de destaque + composição da base */}
      <PanelCard title="Usuários" testID="panel-usuarios">
        <Row columns={columns >= 2 ? 2 : 1}>
          <HeroFigure label="Usuários cadastrados" value={m.totalUsuarios}>
            {m.variacaoNovos != null ? (
              <Delta
                value={m.variacaoNovos}
                period={`novos cadastros (${formatInteger(m.novosUltimos30d)}) vs. 30 dias anteriores`}
              />
            ) : null}
          </HeroFigure>
          <View style={styles.centerColumn}>
            <AppText variant="label" color="onSurfaceVariant">
              Empregados × empregadores
            </AppText>
            <ShareBar
              segments={[
                {
                  label: 'Empregados (candidatos)',
                  amount: m.candidatos,
                  color: colors.dataSeries1,
                },
                { label: 'Empregadores (empresas)', amount: m.empresas, color: colors.dataSeries2 },
              ]}
            />
          </View>
        </Row>
      </PanelCard>

      {/* KPIs */}
      <Row columns={columns}>
        <StatTile
          testID="kpi-empregados"
          icon="person"
          label="Empregados"
          value={formatInteger(m.candidatos)}
          hint="Candidatos cadastrados"
        />
        <StatTile
          testID="kpi-empregadores"
          icon="business"
          label="Empregadores"
          value={formatInteger(m.empresas)}
          hint="Empresas cadastradas"
        />
        <StatTile
          testID="kpi-matches"
          icon="favorite"
          label="Matches"
          value={formatInteger(m.matches)}
          hint={`de ${formatInteger(m.curtidas)} indicações`}
        />
        <StatTile
          testID="kpi-vagas"
          icon="work-outline"
          label="Vagas por empresa"
          value={m.mediaVagasPorEmpresa != null ? formatDecimal(m.mediaVagasPorEmpresa) : '—'}
          hint="Média de vagas abertas"
        />
      </Row>

      <Row columns={columns >= 2 ? 2 : 1}>
        <PanelCard
          title="Indicações que viraram match"
          subtitle="Curtidas correspondidas pelo outro lado"
          testID="panel-taxa"
        >
          <Meter
            fraction={m.taxaMatch ?? 0}
            caption={`${formatInteger(m.matches)} matches de ${formatInteger(m.curtidas)} indicações`}
          />
        </PanelCard>
        <PanelCard
          title="Média de idade"
          subtitle="Dos candidatos cadastrados"
          testID="panel-idade"
        >
          <AppText style={styles.bigNumber} testID="media-idade">
            {m.mediaIdade != null ? `${formatDecimal(m.mediaIdade)} anos` : '—'}
          </AppText>
        </PanelCard>
      </Row>

      <Row columns={columns >= 2 ? 2 : 1}>
        <PanelCard
          title="Matches por semana"
          subtitle="Últimas 8 semanas (início da semana)"
          testID="panel-semanas"
          table={
            <DataTable
              columns={['Semana', 'Matches']}
              rows={m.matchesPorSemana.map((w) => [w.semana, formatInteger(w.matches)])}
            />
          }
        >
          <ColumnChart
            testID="chart-semanas"
            unit="matches"
            labelIndex={lastWeek}
            data={m.matchesPorSemana.map((w) => ({ label: w.semana, amount: w.matches }))}
          />
        </PanelCard>
        <PanelCard
          title="Candidatos por faixa etária"
          subtitle={
            m.mediaIdade != null ? `Média de ${formatDecimal(m.mediaIdade)} anos` : undefined
          }
          testID="panel-faixas"
          table={
            <DataTable
              columns={['Faixa etária', 'Candidatos']}
              rows={m.faixasEtarias.map((f) => [
                f.faixa,
                `${formatInteger(f.candidatos)} (${formatPercent(f.candidatos / Math.max(1, m.candidatos), 0)})`,
              ])}
            />
          }
        >
          <ColumnChart
            testID="chart-faixas"
            unit="candidatos"
            labelIndex={maxIndex(m.faixasEtarias.map((f) => f.candidatos))}
            data={m.faixasEtarias.map((f) => ({ label: f.faixa, amount: f.candidatos }))}
          />
        </PanelCard>
      </Row>
    </View>
  );
}

const maxIndex = (values: number[]) => values.indexOf(Math.max(...values));

/** Grade responsiva: N colunas de largura igual, quebrando linha. */
function Row({ columns, children }: { columns: number; children: ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <View style={styles.sections}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((item, c) => (
            <View key={c} style={styles.cell}>
              {item}
            </View>
          ))}
          {/* Completa a última linha para manter as larguras iguais. */}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`pad-${k}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

function AccessDenied() {
  const colors = useAppTheme();
  return (
    <View
      style={[styles.centered, styles.denied, { backgroundColor: colors.surface }]}
      testID="admin-denied"
    >
      <MaterialIcons name="lock-outline" size={48} color={colors.secondary} />
      <AppText variant="heading" align="center">
        Acesso restrito
      </AppText>
      <AppText color="onSurfaceVariant" align="center">
        O painel é exclusivo da equipe Linker. Candidatos e empresas usam o app no celular.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  topBar: {
    paddingVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.lg,
    zIndex: 10,
    ...AppShadows.sm,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
  },
  scroll: {
    padding: AppSpacing.lg,
    paddingBottom: AppSpacing.xxl,
  },
  sections: {
    gap: AppSpacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: AppSpacing.lg,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  centerColumn: {
    justifyContent: 'center',
    gap: AppSpacing.sm,
  },
  bigNumber: {
    fontFamily: AppFonts.semibold,
    fontSize: 40,
    lineHeight: 48,
  },
  loading: {
    marginTop: AppSpacing.xxl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.xl,
  },
  denied: {
    borderRadius: 20,
    marginTop: AppSpacing.xl,
  },
});
