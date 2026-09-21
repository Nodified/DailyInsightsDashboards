export default {
  id: 'overview',
  title: 'Sales Overview',
  source: 'data/insights.csv',                    // .csv / .tsv / .json
  filters: [
    { type: 'search', placeholder: 'Search product or region…', columns: ['Product', 'Region'] },
    { type: 'dropdown', column: 'Region' },      // values auto-derived from data
    { type: 'dropdown', column: 'Product' }      // or pin with values: ['Widget A', ...]
  ],
  cards: [
    { label: 'Total Revenue', agg: 'sum', column: 'Revenue', format: 'currency' },
    { label: 'Units Sold', agg: 'sum', column: 'Units' },
    { label: 'Avg Revenue / Record', agg: 'avg', column: 'Revenue', format: 'currency' },
    { label: 'Records', agg: 'count' }
  ],
  charts: [
    { type: 'bar', title: 'Revenue by Region', groupBy: 'Region', agg: 'sum',
      column: 'Revenue', format: 'currency', drilldown: 'region-detail' },
    { type: 'line', title: 'Revenue by Date', groupBy: 'Date', agg: 'sum',
      column: 'Revenue', format: 'currency' },
    { type: 'doughnut', title: 'Units by Product', groupBy: 'Product', agg: 'sum', column: 'Units' }
  ]
};
