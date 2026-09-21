export default {
  id: 'region-detail',
  title: 'Region Detail',
  source: 'data/insights.csv',
  filters: [
    { type: 'search' },
    { type: 'dropdown', column: 'Product' }
  ],
  cards: [
    { label: 'Region Revenue', agg: 'sum', column: 'Revenue', format: 'currency' },
    { label: 'Region Units', agg: 'sum', column: 'Units' }
  ],
  charts: [
    { type: 'bar', title: 'Revenue by Product', groupBy: 'Product', agg: 'sum', column: 'Revenue', format: 'currency' },
    { type: 'doughnut', title: 'Revenue by Channel', groupBy: 'Channel', agg: 'sum', column: 'Revenue' },
    { type: 'line', title: 'Revenue by Date', groupBy: 'Date', agg: 'sum', column: 'Revenue', format: 'currency' }
  ]
};
