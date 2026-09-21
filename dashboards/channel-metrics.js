export default {
  id: 'channel-metrics',
  title: 'Channel Metrics',
  source: 'data/metrics.tsv',
  filters: [{ type: 'search' }, { type: 'dropdown', column: 'Channel' }],
  cards: [
    { label: 'Total Sessions', agg: 'sum', column: 'Sessions', format: 'number' },
    { label: 'Total Conversions', agg: 'sum', column: 'Conversions', format: 'number' },
    { label: 'Avg Conversion Rate', agg: 'avg', column: 'ConversionRate', format: 'percent' }
  ],
  charts: [
    { type: 'bar', title: 'Sessions by Channel', groupBy: 'Channel', agg: 'sum', column: 'Sessions' },
    { type: 'line', title: 'Sessions by Date', groupBy: 'Date', agg: 'sum', column: 'Sessions' },
    { type: 'doughnut', title: 'Conversions by Channel', groupBy: 'Channel', agg: 'sum', column: 'Conversions' }
  ]
};
