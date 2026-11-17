(function initClusterCharts(root, factory) {
  const data = root.ClusterData || (typeof require === 'function' ? require('./cluster-data.js') : null);
  const model = root.ClusterModel || (typeof require === 'function' ? require('./cluster-model.js') : null);
  const i18n = root.ClusterI18n || (typeof require === 'function' ? require('./cluster-i18n.js') : null);
  const api = factory(root, data, model, i18n);
  root.ClusterCharts = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createClusterCharts(root, Data, Model, I18n) {
  'use strict';

  if (!Data || !Model || !I18n) throw new Error('Cluster data, model, and i18n must be loaded before ClusterCharts.');

  function getMount(mountId) {
    return root.document?.getElementById(mountId) || null;
  }

  function getTheme() {
    const styles = root.getComputedStyle?.(root.document.documentElement);
    const css = (name, fallback) => styles?.getPropertyValue(name)?.trim() || fallback;
    return {
      text: css('--text', '#231720'),
      muted: css('--text-muted', '#675767'),
      border: css('--border', '#ded4c7'),
      grid: css('--chart-grid', 'rgba(103,87,103,0.18)'),
      surface: css('--surface', '#fffef8'),
      surface2: css('--surface-2', '#f8f5e9'),
      primary: css('--primary', '#7a005e'),
      success: css('--success', '#3d8664'),
      warning: css('--warning', '#8e0a6b'),
      danger: css('--danger', '#820a62'),
      blue: css('--chart-1', '#2563eb'),
      purple: css('--chart-5', '#7c3aed'),
      teal: css('--chart-6', '#0891b2'),
    };
  }

  function showMissing(mount, language) {
    mount.classList.add('cluster-chart-empty');
    mount.textContent = I18n.t('chart.plotlyMissing', {}, language);
  }

  function draw(mount, traces, layout, config = {}) {
    if (!root.Plotly) {
      showMissing(mount, I18n.getLanguage());
      return false;
    }
    mount.classList.remove('cluster-chart-empty');
    root.Plotly.react(mount, root.CoreI18n?.plotTraces(traces) || traces, layout, {
      displayModeBar: false,
      responsive: true,
      scrollZoom: false,
      ...config,
    });
    return true;
  }

  function baseLayout(height = 390) {
    const theme = getTheme();
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: theme.surface2,
      font: { color: theme.text, family: 'DM Sans, sans-serif', size: 11 },
      margin: { l: 54, r: 24, t: 30, b: 48 },
      height,
      hoverlabel: { bgcolor: theme.surface, bordercolor: theme.border, font: { color: theme.text } },
      legend: { orientation: 'h', x: 0, y: 1.14, font: { size: 10, color: theme.muted } },
    };
  }

  function axisStyle(title) {
    const theme = getTheme();
    return {
      title,
      gridcolor: theme.grid,
      zerolinecolor: theme.grid,
      linecolor: theme.border,
      tickfont: { color: theme.muted, size: 10 },
      titlefont: { color: theme.text, size: 11 },
      automargin: true,
    };
  }

  function scenarioColor(themeName) {
    const theme = getTheme();
    const colors = {
      pressure: theme.danger,
      growth: theme.success,
      defensive: theme.muted,
      volatile: theme.warning,
      cluster: theme.blue,
      stalled: theme.teal,
      shutdown: theme.text,
      custom: theme.purple,
    };
    return colors[themeName] || theme.primary;
  }

  function clusterPalette() {
    const theme = getTheme();
    return {
      Devnya: theme.blue,
      Dimitrovgrad: theme.success,
      Vratsa: theme.warning,
      Burgas: theme.danger,
      Ruse: theme.purple,
      'Razgrad/Peshtera': '#be123c',
      Svishtov: theme.teal,
      Plovdiv: theme.muted,
    };
  }

  function removeTrajectorySelectionHandlers(mount) {
    const handlers = mount.__clusterTrajectorySelectionHandlers;
    if (!handlers) return;
    if (typeof mount.removeListener === 'function') {
      mount.removeListener('plotly_click', handlers.click);
      mount.removeListener('plotly_legendclick', handlers.legendClick);
    }
    mount.__clusterTrajectorySelectionHandlers = null;
  }

  function bindTrajectorySelection(mount, mode, options) {
    removeTrajectorySelectionHandlers(mount);
    mount.classList.remove('cluster-chart-selectable');

    if (mode !== 'scenarios' || typeof options.onScenarioSelect !== 'function' || typeof mount.on !== 'function') return;

    const getScenarioId = (trace) => (
      trace?.meta?.entityType === 'scenario' ? trace.meta.scenarioId : null
    );
    const selectScenario = (scenarioId) => {
      if (scenarioId && scenarioId !== options.selectedScenarioId) options.onScenarioSelect(scenarioId);
    };
    const click = (event) => {
      const point = event?.points?.[0];
      selectScenario(getScenarioId(point?.data || point?.fullData));
    };
    const legendClick = (event) => {
      const trace = event?.data?.[event.curveNumber];
      const scenarioId = getScenarioId(trace);
      if (!scenarioId) return true;
      selectScenario(scenarioId);
      return false;
    };

    mount.on('plotly_click', click);
    mount.on('plotly_legendclick', legendClick);
    mount.__clusterTrajectorySelectionHandlers = { click, legendClick };
    mount.classList.add('cluster-chart-selectable');
  }

  function renderTrajectory(mountId, options = {}, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount) return;
    const mode = options.mode === 'companies' ? 'companies' : 'scenarios';
    const residualLabel = I18n.t('chart.residualEmissions', {}, language);
    let traces;
    let selectedTrajectory;

    if (mode === 'companies') {
      const trajectory = options.trajectory || Model.buildTransitionTrajectory(options.scenario, options.companies || []);
      selectedTrajectory = trajectory;
      const palette = clusterPalette();
      traces = trajectory.companies.map((company) => ({
        type: 'scatter',
        mode: 'lines',
        name: company.company,
        showlegend: company.id === options.selectedCompanyId,
        x: company.points.map((point) => point.year),
        y: company.points.map((point) => point.reduction * 100),
        customdata: company.points.map((point) => point.residualEmissionsKt),
        line: {
          color: palette[company.cluster] || getTheme().muted,
          width: company.id === options.selectedCompanyId ? 3.2 : 1.25,
          dash: company.id === options.selectedCompanyId ? 'solid' : 'dot',
        },
        opacity: company.id === options.selectedCompanyId ? 1 : 0.58,
        hovertemplate: `%{x:.0f}: %{y:.1f}%<br>${residualLabel}: %{customdata:.0f} kt CO2<extra>%{fullData.name}</extra>`,
      }));
      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: I18n.t('trajectory.clusterAverage', {}, language),
        x: trajectory.aggregate.points.map((point) => point.year),
        y: trajectory.aggregate.points.map((point) => point.reduction * 100),
        customdata: trajectory.aggregate.points.map((point) => point.residualEmissionsKt),
        line: { color: getTheme().primary, width: 4 },
        hovertemplate: `%{x:.0f}: %{y:.1f}%<br>${residualLabel}: %{customdata:.0f} kt CO2<extra>%{fullData.name}</extra>`,
      });
    } else {
      const trajectories = options.trajectories || Model.buildScenarioTrajectorySet(options.scenarios || [], options.companies || []);
      selectedTrajectory = trajectories.find((trajectory) => trajectory.scenarioId === options.selectedScenarioId);
      const dashStyles = ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot', 'solid'];
      const orderedTrajectories = trajectories
        .map((trajectory, index) => ({ trajectory, index }))
        .sort((left, right) => (
          Number(left.trajectory.scenarioId === options.selectedScenarioId)
          - Number(right.trajectory.scenarioId === options.selectedScenarioId)
        ));
      traces = orderedTrajectories.map(({ trajectory, index }) => {
        const selected = trajectory.scenarioId === options.selectedScenarioId;
        const trace = {
          type: 'scatter',
          mode: selected ? 'lines+markers' : 'lines',
          name: Model.getScenarioName(trajectory.scenario, language),
          legendrank: index,
          x: trajectory.aggregate.points.map((point) => point.year),
          y: trajectory.aggregate.points.map((point) => point.reduction * 100),
          customdata: trajectory.aggregate.points.map((point) => point.residualEmissionsKt),
          meta: { entityType: 'scenario', scenarioId: trajectory.scenarioId },
          line: {
            color: scenarioColor(trajectory.scenario.theme),
            width: selected ? 4.5 : 2.2,
            dash: selected ? 'solid' : dashStyles[index % dashStyles.length],
          },
          opacity: selected ? 1 : 0.74,
          hovertemplate: `%{x:.0f}: %{y:.1f}%<br>${residualLabel}: %{customdata:.0f} kt CO2<extra>%{fullData.name}</extra>`,
        };
        // Omit `marker` entirely for non-selected traces rather than setting it to
        // `undefined` - Plotly's internal cleanData() does `'line' in trace.marker`
        // on every trace it compares, which throws if marker is present-but-undefined.
        if (selected) {
          trace.marker = {
            color: scenarioColor(trajectory.scenario.theme),
            size: trajectory.aggregate.points.map((point) => (point.year % 5 === 0 ? 6 : 0)),
            line: { color: getTheme().surface, width: 1.5 },
          };
        }
        return trace;
      });
    }

    const showTransitionBreakdown = selectedTrajectory?.transitionDynamics?.type === 'deindustrialisation';
    if (showTransitionBreakdown) {
      const theme = getTheme();
      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: I18n.t('chart.technicalReduction', {}, language),
        x: selectedTrajectory.aggregate.points.map((point) => point.year),
        y: selectedTrajectory.aggregate.points.map((point) => point.technicalReduction * 100),
        line: { color: theme.teal, width: 2.6, dash: 'dash' },
        hovertemplate: '%{x:.0f}: %{y:.1f}%<extra>%{fullData.name}</extra>',
      });
      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: I18n.t('chart.industryActivity', {}, language),
        x: selectedTrajectory.aggregate.points.map((point) => point.year),
        y: selectedTrajectory.aggregate.points.map((point) => point.industrialActivity * 100),
        line: { color: theme.danger, width: 3, dash: 'dot' },
        hovertemplate: '%{x:.0f}: %{y:.1f}%<extra>%{fullData.name}</extra>',
      });
    }

    const rendered = draw(mount, traces, {
      ...baseLayout(390),
      margin: { l: 58, r: 24, t: 54, b: 44 },
      xaxis: { ...axisStyle(I18n.t('chart.year', {}, language)), range: [2025, 2051] },
      yaxis: {
        ...axisStyle(I18n.t(showTransitionBreakdown ? 'chart.transitionPercent' : 'chart.trajectoryY', {}, language)),
        range: [0, 100],
      },
      hovermode: 'closest',
      hoverdistance: 30,
    });
    bindTrajectorySelection(mount, rendered ? mode : null, options);
  }

  function buildNetworkPositions(rows) {
    const clusters = [...new Set(rows.map((row) => row.cluster))];
    const positions = {};
    const columns = Math.max(1, Math.ceil(Math.sqrt(clusters.length)));
    clusters.forEach((cluster, clusterIndex) => {
      const group = rows
        .filter((row) => row.cluster === cluster)
        .sort((a, b) => b.industrial_weight - a.industrial_weight);
      const baseX = clusterIndex % columns;
      const baseY = -Math.floor(clusterIndex / columns);
      const radius = group.length > 1 ? 0.22 : 0;
      group.forEach((row, index) => {
        const angle = group.length > 1 ? (Math.PI * 2 * index) / group.length : 0;
        positions[row.id] = { x: baseX + Math.cos(angle) * radius, y: baseY + Math.sin(angle) * radius };
      });
    });
    return positions;
  }

  function networkTraces(rows, edges, language, colorKey = 'anchorRisk', colorLabelKey = 'network.anchorRisk') {
    const positions = buildNetworkPositions(rows);
    const theme = getTheme();
    const edgeTypesSeen = new Set();
    const edgeTraces = edges.map((edge) => {
      const source = positions[edge.source];
      const target = positions[edge.target];
      if (!source || !target) return null;
      const showLegend = !edgeTypesSeen.has(edge.type);
      edgeTypesSeen.add(edge.type);
      const label = I18n.t(`network.edge.${edge.type}`, {}, language);
      return {
        type: 'scatter',
        mode: 'lines',
        name: label,
        legendgroup: edge.type,
        showlegend: showLegend,
        x: [source.x, target.x],
        y: [source.y, target.y],
        text: [`${label}: ${edge.weight}/3`, `${label}: ${edge.weight}/3`],
        hovertemplate: '%{text}<extra></extra>',
        line: { color: theme.muted, width: 0.8 + Number(edge.weight || 1) * 1.1 },
        opacity: 0.48 + Number(edge.weight || 1) * 0.12,
      };
    }).filter(Boolean);

    const nodeTrace = {
      type: 'scatter',
      mode: 'markers+text',
      name: I18n.t('network.nodes', {}, language),
      x: rows.map((row) => positions[row.id]?.x || 0),
      y: rows.map((row) => positions[row.id]?.y || 0),
      text: rows.map((row) => row.company),
      textposition: 'top center',
      customdata: rows.map((row) => [
        row.cluster,
        Model.toScore20(row[colorKey] ?? row.transitionBalance ?? 0),
        Model.toScore20(row.industrial_weight),
      ]),
      hovertemplate: '%{text}<br>%{customdata[0]}<br>'
        + `${I18n.t(colorLabelKey, {}, language)}: %{customdata[1]:.1f}/20<br>`
        + `${I18n.t('metrics.industrialWeight', {}, language)}: %{customdata[2]:.1f}/20<extra></extra>`,
      marker: {
        size: rows.map((row) => 15 + Model.toScore20(row.industrial_weight) * 0.85),
        color: rows.map((row) => Model.toScore20(row[colorKey] ?? row.transitionBalance ?? 0)),
        colorscale: [[0, theme.success], [0.5, theme.warning], [1, theme.danger]],
        cmin: 0,
        cmax: 20,
        line: { color: theme.surface, width: 1.5 },
        colorbar: { title: I18n.t(colorLabelKey, {}, language), tickfont: { color: theme.muted } },
      },
    };
    return [...edgeTraces, nodeTrace];
  }

  function renderNetwork(mountId, companies, edges = Data.NETWORK_EDGES, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount) return;
    const analysis = Model.analyzeNetwork(companies, edges);
    draw(mount, networkTraces(analysis.nodes, edges, language, 'anchorRisk'), {
      ...baseLayout(470),
      margin: { l: 20, r: 34, t: 38, b: 20 },
      xaxis: { visible: false, fixedrange: true },
      yaxis: { visible: false, fixedrange: true, scaleanchor: 'x', scaleratio: 1 },
      hovermode: 'closest',
    });
  }

  function renderExplorer(mountId, tabId, scenario, scenarios, companies, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount || tabId === 'data') return;
    const rows = Model.applyScenarioToCompanies(companies, scenario);
    const palette = clusterPalette();
    const theme = getTheme();

    if (tabId === 'phase') {
      draw(mount, [{
        type: 'scatter',
        mode: 'markers+text',
        x: rows.map((row) => Model.toScore20(row.T_eff)),
        y: rows.map((row) => Model.toScore20(row.B_eff)),
        text: rows.map((row) => row.company),
        textposition: 'top center',
        customdata: rows.map((row) => [row.cluster, Model.toScore20(row.transitionBalance)]),
        hovertemplate: '%{text}<br>%{customdata[0]}<br>'
          + `${I18n.t('outcome.technology', {}, language)}: %{x:.1f}<br>`
          + `${I18n.t('outcome.business', {}, language)}: %{y:.1f}<br>`
          + `${I18n.t('outcome.balance', {}, language)}: %{customdata[1]:.1f}<extra></extra>`,
        marker: {
          size: rows.map((row) => 10 + Model.toScore20(row.industrial_weight) * 1.15),
          color: rows.map((row) => palette[row.cluster] || theme.primary),
          line: { color: theme.surface, width: 1.5 },
          opacity: 0.9,
        },
      }], {
        ...baseLayout(440),
        xaxis: { ...axisStyle(I18n.t('chart.technologyAxis', {}, language)), range: [0, 20.5] },
        yaxis: { ...axisStyle(I18n.t('chart.businessAxis', {}, language)), range: [0, 20.5] },
        shapes: [
          { type: 'line', x0: 10, x1: 10, y0: 0, y1: 20, line: { color: theme.muted, dash: 'dash', width: 1 } },
          { type: 'line', x0: 0, x1: 20, y0: 10, y1: 10, line: { color: theme.muted, dash: 'dash', width: 1 } },
        ],
      });
      return;
    }

    if (tabId === 'frontier') {
      const frontier = Model.buildScenarioFrontier(scenarios, companies, language);
      draw(mount, [{
        type: 'scatter',
        mode: 'markers+text',
        x: frontier.map((row) => Model.toScore20(row.retention)),
        y: frontier.map((row) => Model.toScore20(row.depth)),
        text: frontier.map((row) => row.scenario),
        textposition: 'top center',
        customdata: frontier.map((row) => [Model.toScore20(row.balance), row.bicontinuousShare * 100]),
        hovertemplate: '%{text}<br>'
          + `${I18n.t('outcome.retention', {}, language)}: %{x:.1f}<br>`
          + `${I18n.t('outcome.depth', {}, language)}: %{y:.1f}<br>`
          + `${I18n.t('outcome.balance', {}, language)}: %{customdata[0]:.1f}<br>`
          + `${I18n.t('outcome.bicontinuous', {}, language)}: %{customdata[1]:.0f}%<extra></extra>`,
        marker: {
          size: frontier.map((row) => 18 + row.bicontinuousShare * 20),
          color: scenarios.map((entry) => scenarioColor(entry.theme)),
          line: { color: theme.surface, width: 1.5 },
        },
      }], {
        ...baseLayout(440),
        xaxis: { ...axisStyle(I18n.t('chart.retentionAxis', {}, language)), range: [0, 20.5] },
        yaxis: { ...axisStyle(I18n.t('chart.depthAxis', {}, language)), range: [0, 20.5] },
      });
      return;
    }

    if (tabId === 'network') {
      const network = Model.analyzeNetwork(companies, Data.NETWORK_EDGES);
      const riskById = Object.fromEntries(network.nodes.map((node) => [node.id, node.anchorRisk]));
      const networkRows = rows.map((row) => ({ ...row, anchorRisk: riskById[row.id] || 0 }));
      draw(mount, networkTraces(networkRows, Data.NETWORK_EDGES, language, 'transitionBalance', 'outcome.balance'), {
        ...baseLayout(460),
        margin: { l: 20, r: 34, t: 38, b: 20 },
        xaxis: { visible: false, fixedrange: true },
        yaxis: { visible: false, fixedrange: true, scaleanchor: 'x', scaleratio: 1 },
      });
      return;
    }

    if (tabId === 'heatmap') {
      const bottleneckKeys = ['finance', 'permitting', 'infrastructure', 'market', 'carbon', 'power'];
      draw(mount, [{
        type: 'heatmap',
        z: bottleneckKeys.map((key) => rows.map((row) => Model.toScore20(row.bottlenecks[key]))),
        x: rows.map((row) => row.company),
        y: bottleneckKeys.map((key) => I18n.t(`bottleneck.${key}`, {}, language)),
        colorscale: [[0, theme.success], [0.5, theme.warning], [1, theme.danger]],
        zmin: 0,
        zmax: 20,
        hovertemplate: '%{x}<br>%{y}: %{z:.1f}/20<extra></extra>',
        colorbar: { title: I18n.t('chart.severity', {}, language), tickfont: { color: theme.muted } },
      }], {
        ...baseLayout(460),
        margin: { l: 120, r: 40, t: 28, b: 120 },
        xaxis: { ...axisStyle(''), tickangle: -32 },
        yaxis: axisStyle(''),
      });
    }
  }

  function renderPortfolio(mountId, portfolios, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount) return;
    const theme = getTheme();
    const rows = portfolios.filter((portfolio) => portfolio.capexM > 0 || portfolio.abatementKt > 0);
    draw(mount, [{
      type: 'scatter',
      mode: 'markers+text',
      x: rows.map((row) => row.capexM),
      y: rows.map((row) => row.abatementKt),
      text: rows.map((row) => row.company),
      textposition: 'top center',
      customdata: rows.map((row) => [row.pathwayCount, row.firstStartYear || '-']),
      hovertemplate: '%{text}<br>CAPEX: EUR %{x:.1f}m<br>'
        + `${I18n.t('general.abatement', {}, language)}: %{y:.1f} kt<br>`
        + `${I18n.t('companies.pathways', {}, language)}: %{customdata[0]}<br>`
        + `${I18n.t('general.year', {}, language)}: %{customdata[1]}<extra></extra>`,
      marker: {
        size: rows.map((row) => 12 + Math.min(28, row.pathwayCount * 5)),
        color: rows.map((_, index) => index),
        colorscale: [[0, theme.blue], [0.5, theme.success], [1, theme.primary]],
        line: { color: theme.surface, width: 1.5 },
      },
    }], {
      ...baseLayout(410),
      xaxis: { ...axisStyle(I18n.t('chart.capexAxis', {}, language)), rangemode: 'tozero' },
      yaxis: { ...axisStyle(I18n.t('chart.abatementAxis', {}, language)), rangemode: 'tozero' },
      showlegend: false,
    });
  }

  function renderSensitivity(mountId, sensitivityRows, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount) return;
    const theme = getTheme();
    const rows = sensitivityRows.slice(0, 10).reverse();
    draw(mount, [
      {
        type: 'bar', orientation: 'h', name: I18n.t('outcome.depth', {}, language),
        y: rows.map((row) => I18n.t(`parameter.${row.key}`, {}, language)),
        x: rows.map((row) => row.depthImpact20),
        marker: { color: theme.success },
        hovertemplate: '%{y}: %{x:+.2f}<extra></extra>',
      },
      {
        type: 'bar', orientation: 'h', name: I18n.t('outcome.retention', {}, language),
        y: rows.map((row) => I18n.t(`parameter.${row.key}`, {}, language)),
        x: rows.map((row) => row.retentionImpact20),
        marker: { color: theme.primary },
        hovertemplate: '%{y}: %{x:+.2f}<extra></extra>',
      },
    ], {
      ...baseLayout(430),
      barmode: 'group',
      margin: { l: 170, r: 24, t: 36, b: 45 },
      xaxis: axisStyle(I18n.t('general.points', {}, language)),
      yaxis: axisStyle(''),
    });
  }

  function renderMonteCarlo(mountId, monteCarlo, language = I18n.getLanguage()) {
    const mount = getMount(mountId);
    if (!mount) return;
    const theme = getTheme();
    const keys = ['depth', 'retention', 'continuity', 'balance'];
    const labels = keys.map((key) => I18n.t(`outcome.${key}`, {}, language));
    const p10 = keys.map((key) => Model.toScore20(monteCarlo.summary[key].p10));
    const p50 = keys.map((key) => Model.toScore20(monteCarlo.summary[key].p50));
    const p90 = keys.map((key) => Model.toScore20(monteCarlo.summary[key].p90));
    draw(mount, [{
      type: 'scatter',
      mode: 'markers',
      x: p50,
      y: labels,
      error_x: {
        type: 'data',
        symmetric: false,
        array: p90.map((value, index) => value - p50[index]),
        arrayminus: p50.map((value, index) => value - p10[index]),
        color: theme.primary,
        thickness: 4,
        width: 8,
      },
      marker: { size: 12, color: theme.primary, line: { color: theme.surface, width: 1.5 } },
      customdata: keys.map((key) => [
        Model.toScore20(monteCarlo.summary[key].p10),
        Model.toScore20(monteCarlo.summary[key].p50),
        Model.toScore20(monteCarlo.summary[key].p90),
      ]),
      hovertemplate: '%{y}<br>P10: %{customdata[0]:.1f}<br>P50: %{customdata[1]:.1f}<br>P90: %{customdata[2]:.1f}<extra></extra>',
    }], {
      ...baseLayout(330),
      margin: { l: 175, r: 35, t: 26, b: 44 },
      xaxis: { ...axisStyle(I18n.t('general.scale', {}, language)), range: [0, 20] },
      yaxis: axisStyle(''),
      showlegend: false,
    });
  }

  function purge(ids) {
    if (typeof root.Plotly?.purge !== 'function') return;
    ids.forEach((id) => {
      const mount = getMount(id);
      if (mount) root.Plotly.purge(mount);
    });
  }

  return Object.freeze({
    renderTrajectory,
    renderExplorer,
    renderNetwork,
    renderPortfolio,
    renderSensitivity,
    renderMonteCarlo,
    purge,
  });
});
