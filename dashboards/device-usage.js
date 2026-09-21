export default {
  id: 'device-usage',
  title: 'Device Usage',
  source: 'data/devices.json',
  filters: [{ type: 'search' }, { type: 'dropdown', column: 'geo.country' }],
  cards: [
    { label: 'Total Users', agg: 'sum', column: 'users' },
    { label: 'Avg Session (min)', agg: 'avg', column: 'session.avgMinutes', format: 'number' }
  ],
  charts: [
    { type: 'doughnut', title: 'Users by Device', groupBy: 'device', agg: 'sum', column: 'users' },
    { type: 'bar', title: 'Users by Country', groupBy: 'geo.country', agg: 'sum', column: 'users' },
    { type: 'line', title: 'Avg Session by Date', groupBy: 'date', agg: 'avg', column: 'session.avgMinutes' }
  ]
};
