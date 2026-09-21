// js/chartFactory.js — renders chart tiles via Chart.js and wires drill-down clicks.
import { aggregate, formatValue } from './aggregator.js';
import config from '../config/theme.config.js';
import { el, escapeHtml } from './util.js';

const instances = [];

export function clearCharts() {
  instances.forEach(c => c.destroy());
  instances.length = 0;
}

export function renderChart(container, spec, rows, theme, onDrilldown) {
  const isPie = spec.type === 'doughnut' || spec.type === 'pie';

  const tile = el(`<div class="chart-tile">
      <h3>${escapeHtml(spec.title || '')}</h3>
      ${spec.drilldown ? '<p class="hint">Click an item to drill down</p>' : ''}
      <div class="chart-holder"><canvas></canvas></div>
    </div>`);
  container.appendChild(tile);

  const { labels, values } = aggregate(rows, {
    groupBy: spec.groupBy,
    agg: spec.agg || 'sum',
    column: spec.column,
    topN: spec.topN || (isPie ? 12 : undefined),   // pies: cap segments, merge rest into "Other"
    sort: spec.sort || (spec.type === 'line' ? 'label' : 'value')
  });
  const colors = labels.map((_, i) => theme.palette[i % theme.palette.length]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Cartesian: tooltip follows the column. Pies: only when directly over an arc.
    interaction: isPie ? { mode: 'nearest', intersect: true } : { mode: 'index', intersect: false },
    plugins: {
      legend: { display: isPie, position: 'bottom', labels: { color: theme.text, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = isPie ? ctx.parsed : ctx.parsed.y;
            return ` ${ctx.label}: ${formatValue(v, spec.format, config.currency, config.locale)}`;
          }
        }
      }
    }
  };
  if (!isPie) {
    options.scales = {
      x: { ticks: { color: theme.muted, maxRotation: 45, autoSkip: true }, grid: { display: false } },
      y: {
        ticks: { color: theme.muted, callback: (v) => formatValue(v, spec.format, config.currency, config.locale) },
        grid: { color: theme.border }
      }
    };
  }
  if (spec.drilldown) {
    options.onClick = (evt, els) => {
      if (!els.length) return;
      onDrilldown(spec.drilldown, spec.groupBy, labels[els[0].index]);
    };
    options.onHover = (evt, els) => {
      evt.native.target.style.cursor = els.length ? 'pointer' : 'default';
    };
  }

  instances.push(new Chart(tile.querySelector('canvas'), {
    type: spec.type,
    data: {
      labels,
      datasets: [{
        label: spec.title,
        data: values,
        backgroundColor: colors,
        borderColor: isPie ? theme.surface : theme.palette[0],
        borderWidth: isPie ? 2 : 0,
        borderRadius: 4,
        pointRadius: 3,
        tension: 0.3
      }]
    },
    options
  }));
}
