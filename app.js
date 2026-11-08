/**
 * SalesPulse Analytics Dashboard
 * Vanilla JavaScript Engine (Web Storage Persistence & Pure Canvas Rendering)
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'salespulse_analytics_data_v1';

  // Color Palette Constants (No CSS variables)
  const PALETTE = {
    blue: '#3b82f6',
    blueAlpha: 'rgba(59, 130, 246, 0.25)',
    blueHover: '#2563eb',
    emerald: '#10b981',
    emeraldAlpha: 'rgba(16, 185, 129, 0.25)',
    indigo: '#6366f1',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    pink: '#ec4899',
    rose: '#f43f5e',
    gridLine: '#1e293b',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    textBright: '#f8fafc',
    surfaceDark: '#0f172a',
    cardDark: '#111827'
  };

  const CATEGORY_COLORS = {
    'SaaS Subscriptions': '#3b82f6',
    'Enterprise Software': '#8b5cf6',
    'Consulting & Advisory': '#10b981',
    'Cloud Infrastructure': '#06b6d4',
    'Security & Compliance': '#f59e0b',
    'Hardware Solutions': '#ec4899'
  };

  // State Management
  const state = {
    transactions: [],
    datePreset: '30d',
    customStartDate: null,
    customEndDate: null,
    timelineMetric: 'revenue', // 'revenue' | 'orders'
    searchQuery: '',
    categoryFilter: 'ALL',
    statusFilter: 'ALL',
    sortBy: 'date-desc',
    currentPage: 1,
    pageSize: 8,
    activeEditId: null,
    canvasHoverLineIndex: null,
    canvasHoverDonutSlice: null,
    canvasHoverBarIndex: null
  };

  // DOM Elements Cache
  const DOM = {
    // KPI Cards
    metricTotalRevenue: document.getElementById('metricTotalRevenue'),
    trendRevenueVal: document.getElementById('trendRevenueVal'),
    trendRevenue: document.getElementById('trendRevenue'),
    trendPeriodText: document.getElementById('trendPeriodText'),
    metricNetProfit: document.getElementById('metricNetProfit'),
    metricMarginRate: document.getElementById('metricMarginRate'),
    metricTotalOrders: document.getElementById('metricTotalOrders'),
    metricOrdersBreakdown: document.getElementById('metricOrdersBreakdown'),
    metricAov: document.getElementById('metricAov'),
    metricRefundRate: document.getElementById('metricRefundRate'),
    metricRefundAmount: document.getElementById('metricRefundAmount'),

    // Canvas & Charts
    revenueCanvas: document.getElementById('revenueCanvas'),
    revenueContainer: document.getElementById('revenueChartContainer'),
    revenueTooltip: document.getElementById('revenueTooltip'),
    periodPeakVal: document.getElementById('periodPeakVal'),
    dailyAvgVal: document.getElementById('dailyAvgVal'),
    activeDaysVal: document.getElementById('activeDaysVal'),
    timelineMetricToggle: document.getElementById('timelineMetricToggle'),

    categoryDonutCanvas: document.getElementById('categoryDonutCanvas'),
    donutContainer: document.getElementById('donutContainer'),
    donutTooltip: document.getElementById('donutTooltip'),
    donutCenterTotal: document.getElementById('donutCenterTotal'),
    categoryLegendList: document.getElementById('categoryLegendList'),

    channelCanvas: document.getElementById('channelCanvas'),
    channelContainer: document.getElementById('channelChartContainer'),
    channelTooltip: document.getElementById('channelTooltip'),
    channelCountBadge: document.getElementById('channelCountBadge'),
    salesRepLeaderboard: document.getElementById('salesRepLeaderboard'),

    // Filters & Headers
    datePresetGroup: document.getElementById('datePresetGroup'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    applyCustomDateBtn: document.getElementById('applyCustomDateBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    openAddSaleModalBtn: document.getElementById('openAddSaleModalBtn'),

    // Table
    tableSearchInput: document.getElementById('tableSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterCategory: document.getElementById('filterCategory'),
    filterStatus: document.getElementById('filterStatus'),
    sortBySelect: document.getElementById('sortBySelect'),
    filteredCountBadge: document.getElementById('filteredCountBadge'),
    transactionsTable: document.getElementById('transactionsTable'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    resetTableFiltersBtn: document.getElementById('resetTableFiltersBtn'),
    tablePaginationFooter: document.getElementById('tablePaginationFooter'),
    paginationInfo: document.getElementById('paginationInfo'),
    pageRangeStart: document.getElementById('pageRangeStart'),
    pageRangeEnd: document.getElementById('pageRangeEnd'),
    pageTotalItems: document.getElementById('pageTotalItems'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageNumbersGroup: document.getElementById('pageNumbersGroup'),

    // Modals
    saleModalOverlay: document.getElementById('saleModalOverlay'),
    saleForm: document.getElementById('saleForm'),
    saleFormId: document.getElementById('saleFormId'),
    modalTitle: document.getElementById('modalTitle'),
    saveBtnText: document.getElementById('saveBtnText'),
    closeSaleModalBtn: document.getElementById('closeSaleModalBtn'),
    cancelSaleFormBtn: document.getElementById('cancelSaleFormBtn'),

    formCustomerName: document.getElementById('formCustomerName'),
    formCustomerEmail: document.getElementById('formCustomerEmail'),
    formProductName: document.getElementById('formProductName'),
    formCategory: document.getElementById('formCategory'),
    formAmount: document.getElementById('formAmount'),
    formCost: document.getElementById('formCost'),
    formChannel: document.getElementById('formChannel'),
    formRep: document.getElementById('formRep'),
    formPaymentMethod: document.getElementById('formPaymentMethod'),
    formStatus: document.getElementById('formStatus'),
    formDate: document.getElementById('formDate'),

    detailsModalOverlay: document.getElementById('detailsModalOverlay'),
    detailsModalTitle: document.getElementById('detailsModalTitle'),
    detailsInvoiceId: document.getElementById('detailsInvoiceId'),
    detailsStatusBadge: document.getElementById('detailsStatusBadge'),
    invoiceSheetContent: document.getElementById('invoiceSheetContent'),
    closeDetailsModalBtn: document.getElementById('closeDetailsModalBtn'),
    detailsCloseBtn: document.getElementById('detailsCloseBtn'),
    detailsEditBtn: document.getElementById('detailsEditBtn'),
    detailsDeleteBtn: document.getElementById('detailsDeleteBtn'),

    toastStack: document.getElementById('toastStack')
  };

  // -------------------------------------------------------------------------
  // Realistic Seed Dataset
  // -------------------------------------------------------------------------
  function generateDefaultSeedData() {
    const clients = [
      { name: 'Apex Financial Group', email: 'billing@apexfinancial.com' },
      { name: 'Nova BioLabs Inc', email: 'procure@novabiolabs.io' },
      { name: 'Starlight Media Corp', email: 'finance@starlightmedia.com' },
      { name: 'Vanguard Logistics', email: 'accounts@vanguardlog.net' },
      { name: 'AeroTech Dynamics', email: 'purchasing@aerotechdyn.com' },
      { name: 'OmniHealth Network', email: 'invoices@omnihealth.org' },
      { name: 'Quantum Analytics Ltd', email: 'treasury@quantum-analytica.io' },
      { name: 'Summit Capital Partners', email: 'ops@summitcap.com' },
      { name: 'Zenith Global Retail', email: 'ap@zenithretail.com' },
      { name: 'Horizon Cyber Systems', email: 'orders@horizoncyber.com' },
      { name: 'Pinnacle Clean Energy', email: 'finance@pinnacleenergy.co' },
      { name: 'Meridian Robotics Corp', email: 'billing@meridianrobotics.ai' },
      { name: 'BlueSky Enterprise Media', email: 'invoicing@blueskymedia.com' },
      { name: 'Solaria Solar Systems', email: 'accounts@solariasystems.com' },
      { name: 'Krypton Data Foundry', email: 'treasury@kryptondata.io' },
      { name: 'Prism Digital Studios', email: 'finance@prismdigital.design' },
      { name: 'Hyperion Defense Solutions', email: 'contracts@hyperiondefense.gov.mock' },
      { name: 'Cascade Pure Water', email: 'ap@cascadepure.org' },
      { name: 'UrbanGrid Smart IoT', email: 'accounting@urbangrid.net' },
      { name: 'Silverline Industrial Co', email: 'purchases@silverlineind.com' }
    ];

    const catalog = [
      { product: 'Enterprise Cloud Suite (Annual)', category: 'SaaS Subscriptions', basePrice: 4200, costRatio: 0.18 },
      { product: 'AI Copilot Team Seats (50-pack)', category: 'Enterprise Software', basePrice: 2800, costRatio: 0.22 },
      { product: 'Multi-Cloud Architecture & Migration', category: 'Cloud Infrastructure', basePrice: 7500, costRatio: 0.35 },
      { product: 'Zero-Trust SOC2 Pen-Test & Audit', category: 'Security & Compliance', basePrice: 6200, costRatio: 0.25 },
      { product: 'Quarterly Executive Strategic Advisory', category: 'Consulting & Advisory', basePrice: 9000, costRatio: 0.30 },
      { product: 'Managed Edge Appliance Rack X8', category: 'Hardware Solutions', basePrice: 8400, costRatio: 0.55 },
      { product: 'Kubernetes Cluster Fleet Manager', category: 'Cloud Infrastructure', basePrice: 3900, costRatio: 0.20 },
      { product: 'DevSecOps Automation Pipeline', category: 'Enterprise Software', basePrice: 3400, costRatio: 0.15 },
      { product: 'Customer Journey Predictive Engine', category: 'SaaS Subscriptions', basePrice: 5100, costRatio: 0.24 },
      { product: 'Hardware Cryptographic HSM Module', category: 'Hardware Solutions', basePrice: 4600, costRatio: 0.52 }
    ];

    const reps = ['Elena Rostova', 'Marcus Vance', 'Sophia Chen', 'Tariq Al-Mansoor', 'Jordan Hayes'];
    const channels = ['Direct Sales', 'Inside Sales', 'Inbound Web', 'Partner Referral'];
    const paymentMethods = ['ACH / Bank Wire', 'Credit Card', 'Net 30 Invoice', 'Stripe Online'];
    const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Processing', 'Refunded'];

    const seedTransactions = [];
    // Anchor current date to simulated November 2026
    const baseDate = new Date(2026, 10, 8, 14, 0, 0); // Nov 8, 2026

    // Generate 48 realistic historical records spanning the last 75 days
    for (let i = 1; i <= 48; i++) {
      const dayOffset = Math.floor((i / 48) * 75); // 0 to 75 days ago
      const txDate = new Date(baseDate.getTime() - dayOffset * 86400000 - Math.floor(Math.random() * 50000000));
      const client = clients[i % clients.length];
      const item = catalog[(i * 3) % catalog.length];
      const variance = 0.85 + Math.random() * 0.45;
      const amount = Math.round(item.basePrice * variance * 100) / 100;
      const cost = Math.round(amount * item.costRatio * 100) / 100;
      const status = i === 12 || i === 31 ? 'Refunded' : (i % 7 === 0 ? 'Pending' : (i % 11 === 0 ? 'Processing' : 'Completed'));

      seedTransactions.push({
        id: `INV-${1000 + i}`,
        date: txDate.toISOString(),
        customer: client.name,
        email: client.email,
        product: item.product,
        category: item.category,
        amount: amount,
        cost: cost,
        channel: channels[i % channels.length],
        rep: reps[i % reps.length],
        paymentMethod: paymentMethods[i % paymentMethods.length],
        status: status
      });
    }

    // Sort newest first
    seedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return seedTransactions;
  }

  // -------------------------------------------------------------------------
  // Storage Management
  // -------------------------------------------------------------------------
  function loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using default seed data.', err);
    }
    const defaults = generateDefaultSeedData();
    saveTransactions(defaults);
    return defaults;
  }

  function saveTransactions(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
      showToast('Storage Error', 'Could not save data to browser storage', 'error');
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Analytics Engine
  // -------------------------------------------------------------------------
  function getReferenceCurrentDate() {
    // Determine the latest date present in data or default to Nov 8, 2026
    if (state.transactions.length > 0) {
      const maxDate = new Date(Math.max(...state.transactions.map(t => new Date(t.date).getTime())));
      if (!isNaN(maxDate.getTime())) return maxDate;
    }
    return new Date(2026, 10, 8, 23, 59, 59);
  }

  function getDateRangeBoundaries() {
    const ref = getReferenceCurrentDate();
    let start = new Date(ref);
    let end = new Date(ref);
    let priorStart = null;
    let priorEnd = null;

    if (state.datePreset === '7d') {
      start.setDate(ref.getDate() - 7);
      priorEnd = new Date(start);
      priorStart = new Date(start);
      priorStart.setDate(priorStart.getDate() - 7);
    } else if (state.datePreset === '30d') {
      start.setDate(ref.getDate() - 30);
      priorEnd = new Date(start);
      priorStart = new Date(start);
      priorStart.setDate(priorStart.getDate() - 30);
    } else if (state.datePreset === '90d') {
      start.setDate(ref.getDate() - 90);
      priorEnd = new Date(start);
      priorStart = new Date(start);
      priorStart.setDate(priorStart.getDate() - 90);
    } else if (state.datePreset === 'ytd') {
      start = new Date(ref.getFullYear(), 0, 1);
      const spanDays = Math.max(1, Math.floor((ref - start) / 86400000));
      priorEnd = new Date(start);
      priorStart = new Date(start);
      priorStart.setDate(priorStart.getDate() - spanDays);
    } else if (state.datePreset === 'custom' && state.customStartDate && state.customEndDate) {
      start = new Date(state.customStartDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(state.customEndDate);
      end.setHours(23, 59, 59, 999);
      const spanDays = Math.max(1, Math.floor((end - start) / 86400000));
      priorEnd = new Date(start);
      priorStart = new Date(start);
      priorStart.setDate(priorStart.getDate() - spanDays);
    } else {
      // 'all'
      start = new Date(0);
      priorStart = null;
      priorEnd = null;
    }

    return { start, end, priorStart, priorEnd };
  }

  function getTransactionsInDateRange(start, end) {
    return state.transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  function computeKPIs(currentTxList, priorTxList) {
    // Current period revenue (Completed + Processing)
    let grossRevenue = 0;
    let totalCost = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;
    let refundAmount = 0;

    currentTxList.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cst = Number(t.cost) || 0;

      if (t.status === 'Completed' || t.status === 'Processing') {
        grossRevenue += amt;
        totalCost += cst;
        if (t.status === 'Completed') completedCount++;
      } else if (t.status === 'Pending') {
        pendingCount++;
      } else if (t.status === 'Refunded') {
        refundedCount++;
        refundAmount += amt;
      }
    });

    const netProfit = Math.max(0, grossRevenue - totalCost);
    const marginRate = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const aov = completedCount > 0 ? grossRevenue / completedCount : 0;
    const totalTransactions = currentTxList.length;
    const refundRate = totalTransactions > 0 ? (refundedCount / totalTransactions) * 100 : 0;

    // Prior period revenue comparison
    let priorRevenue = 0;
    if (priorTxList && priorTxList.length > 0) {
      priorTxList.forEach(t => {
        if (t.status === 'Completed' || t.status === 'Processing') {
          priorRevenue += Number(t.amount) || 0;
        }
      });
    }

    let revenueGrowth = 0;
    if (priorRevenue > 0) {
      revenueGrowth = ((grossRevenue - priorRevenue) / priorRevenue) * 100;
    } else if (grossRevenue > 0) {
      revenueGrowth = 100;
    }

    return {
      grossRevenue,
      netProfit,
      marginRate,
      completedCount,
      pendingCount,
      refundedCount,
      refundAmount,
      aov,
      refundRate,
      revenueGrowth,
      hasPriorPeriod: priorTxList !== null
    };
  }

  // -------------------------------------------------------------------------
  // Currency & Text Formatters
  // -------------------------------------------------------------------------
  function formatCurrency(amount, compact = false) {
    const val = Number(amount) || 0;
    if (compact) {
      if (Math.abs(val) >= 1000000) {
        return '$' + (val / 1000000).toFixed(1) + 'M';
      }
      if (Math.abs(val) >= 1000) {
        return '$' + (val / 1000).toFixed(1) + 'k';
      }
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }

  function formatShortDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatFullDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // -------------------------------------------------------------------------
  // Render KPI Overview
  // -------------------------------------------------------------------------
  function renderKPIs(kpis) {
    DOM.metricTotalRevenue.textContent = formatCurrency(kpis.grossRevenue);

    // Trend indicator
    if (kpis.hasPriorPeriod) {
      const sign = kpis.revenueGrowth >= 0 ? '+' : '';
      DOM.trendRevenueVal.textContent = `${sign}${kpis.revenueGrowth.toFixed(1)}%`;
      if (kpis.revenueGrowth >= 0) {
        DOM.trendRevenue.className = 'kpi-trend trend-up';
      } else {
        DOM.trendRevenue.className = 'kpi-trend trend-down';
      }
      DOM.trendPeriodText.textContent = 'vs prior period';
    } else {
      DOM.trendRevenueVal.textContent = 'N/A';
      DOM.trendRevenue.className = 'kpi-trend';
      DOM.trendPeriodText.textContent = 'Lifetime baseline';
    }

    DOM.metricNetProfit.textContent = formatCurrency(kpis.netProfit);
    DOM.metricMarginRate.textContent = `${kpis.marginRate.toFixed(1)}% Margin`;

    DOM.metricTotalOrders.textContent = kpis.completedCount.toLocaleString();
    DOM.metricOrdersBreakdown.textContent = `${kpis.completedCount} completed \u2022 ${kpis.pendingCount} pending`;

    DOM.metricAov.textContent = formatCurrency(kpis.aov);
    DOM.metricRefundRate.textContent = `${kpis.refundRate.toFixed(1)}%`;
    DOM.metricRefundAmount.textContent = `${formatCurrency(kpis.refundAmount)} returned`;
  }

  // -------------------------------------------------------------------------
  // Pure Canvas Charts: Timeline Revenue Curve
  // -------------------------------------------------------------------------
  let timelineChartDataPoints = []; // for mouse tracking

  function aggregateTimelineData(transactions, startDate, endDate) {
    // Generate buckets by day
    const dayMap = new Map();

    // Determine span
    const minTime = startDate.getTime() === 0
      ? (transactions.length ? Math.min(...transactions.map(t => new Date(t.date).getTime())) : Date.now() - 30 * 86400000)
      : startDate.getTime();
    const maxTime = endDate.getTime();

    const cursor = new Date(minTime);
    cursor.setHours(0, 0, 0, 0);
    const endCursor = new Date(maxTime);
    endCursor.setHours(23, 59, 59, 999);

    // Populate day buckets
    while (cursor <= endCursor) {
      const key = cursor.toISOString().split('T')[0];
      dayMap.set(key, { date: new Date(cursor), revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    transactions.forEach(t => {
      const key = t.date.split('T')[0];
      if (dayMap.has(key)) {
        const item = dayMap.get(key);
        if (t.status === 'Completed' || t.status === 'Processing') {
          item.revenue += Number(t.amount) || 0;
          item.orders += 1;
        }
      }
    });

    return Array.from(dayMap.values());
  }

  function renderTimelineChart(data) {
    const canvas = DOM.revenueCanvas;
    const ctx = canvas.getContext('2d');
    const container = DOM.revenueContainer;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No transaction data for this time period', width / 2, height / 2);
      return;
    }

    const metricKey = state.timelineMetric; // 'revenue' or 'orders'
    const values = data.map(d => d[metricKey]);
    const maxVal = Math.max(...values, metricKey === 'revenue' ? 1000 : 5);
    const minVal = 0;

    // Summary stats
    const totalMetric = values.reduce((a, b) => a + b, 0);
    const peakVal = Math.max(...values);
    const activeDays = values.filter(v => v > 0).length;
    const dailyAvg = data.length > 0 ? totalMetric / data.length : 0;

    DOM.periodPeakVal.textContent = metricKey === 'revenue' ? formatCurrency(peakVal) : peakVal + ' orders';
    DOM.dailyAvgVal.textContent = metricKey === 'revenue' ? formatCurrency(dailyAvg) : dailyAvg.toFixed(1) + '/day';
    DOM.activeDaysVal.textContent = `${activeDays} / ${data.length} days`;

    // Coordinates padding
    const padLeft = 60;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 34;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines & Y labels
    const gridRows = 4;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridRows; i++) {
      const yVal = minVal + ((maxVal - minVal) / gridRows) * (gridRows - i);
      const yPos = padTop + (chartH / gridRows) * i;

      ctx.strokeStyle = PALETTE.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      ctx.fillStyle = PALETTE.textMuted;
      const label = metricKey === 'revenue' ? formatCurrency(yVal, true) : Math.round(yVal).toString();
      ctx.fillText(label, padLeft - 10, yPos);
    }

    // Compute pixel points
    timelineChartDataPoints = data.map((d, index) => {
      const x = padLeft + (index / Math.max(1, data.length - 1)) * chartW;
      const y = padTop + chartH - ((d[metricKey] - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, data: d, index };
    });

    if (timelineChartDataPoints.length < 2) return;

    // Draw Area Gradient Fill
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.08)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    ctx.beginPath();
    ctx.moveTo(timelineChartDataPoints[0].x, padTop + chartH);
    for (let i = 0; i < timelineChartDataPoints.length; i++) {
      const pt = timelineChartDataPoints[i];
      if (i === 0) {
        ctx.lineTo(pt.x, pt.y);
      } else {
        const prev = timelineChartDataPoints[i - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    }
    ctx.lineTo(timelineChartDataPoints[timelineChartDataPoints.length - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Main Line
    ctx.beginPath();
    for (let i = 0; i < timelineChartDataPoints.length; i++) {
      const pt = timelineChartDataPoints[i];
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        const prev = timelineChartDataPoints[i - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    }
    ctx.strokeStyle = PALETTE.blue;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw X-axis tick labels
    const step = Math.max(1, Math.floor(data.length / 6));
    ctx.fillStyle = PALETTE.textLight;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < data.length; i += step) {
      const pt = timelineChartDataPoints[i];
      const d = data[i].date;
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(label, pt.x, padTop + chartH + 10);
    }

    // Hover Indicator Point & Crosshair
    if (state.canvasHoverLineIndex !== null && state.canvasHoverLineIndex < timelineChartDataPoints.length) {
      const hoverPt = timelineChartDataPoints[state.canvasHoverLineIndex];

      // Vertical guide line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hoverPt.x, padTop);
      ctx.lineTo(hoverPt.x, padTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(hoverPt.x, hoverPt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------------------
  // Pure Canvas Charts: Category Donut Chart
  // -------------------------------------------------------------------------
  let donutSlices = [];

  function aggregateCategoryData(transactions) {
    const map = new Map();

    transactions.forEach(t => {
      if (t.status === 'Completed' || t.status === 'Processing') {
        const cat = t.category || 'Other';
        const amt = Number(t.amount) || 0;
        map.set(cat, (map.get(cat) || 0) + amt);
      }
    });

    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    const sorted = Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || PALETTE.purple
      }))
      .sort((a, b) => b.value - a.value);

    return { slices: sorted, total };
  }

  function renderCategoryDonut(catData) {
    const canvas = DOM.categoryDonutCanvas;
    const ctx = canvas.getContext('2d');
    const width = 200;
    const height = 200;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    DOM.donutCenterTotal.textContent = formatCurrency(catData.total, true);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = 88;
    const innerRadius = 60;

    donutSlices = [];

    if (catData.slices.length === 0 || catData.total === 0) {
      // Empty grey ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      DOM.categoryLegendList.innerHTML = '<div style="color:#64748b;font-size:0.8rem;text-align:center;padding:12px;">No sales recorded for this timeframe</div>';
      return;
    }

    let startAngle = -Math.PI / 2;

    catData.slices.forEach((slice, index) => {
      const sliceAngle = (slice.pct / 100) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const isHovered = state.canvasHoverDonutSlice === index;
      const radOuter = isHovered ? outerRadius + 5 : outerRadius;
      const radInner = innerRadius;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radOuter, startAngle, endAngle);
      ctx.arc(centerX, centerY, radInner, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();

      // Divider stroke
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      donutSlices.push({
        index,
        name: slice.name,
        value: slice.value,
        pct: slice.pct,
        startAngle,
        endAngle,
        color: slice.color,
        centerX,
        centerY,
        innerRadius,
        outerRadius: radOuter
      });

      startAngle = endAngle;
    });

    // Populate Legend breakdown list
    renderCategoryLegend(catData.slices);
  }

  function renderCategoryLegend(slices) {
    DOM.categoryLegendList.innerHTML = slices.map(s => `
      <div class="cat-legend-item" data-category="${escapeHtml(s.name)}">
        <div class="cat-legend-left">
          <span class="cat-color-dot" style="background-color: ${s.color};"></span>
          <span class="cat-name">${escapeHtml(s.name)}</span>
        </div>
        <div class="cat-legend-right">
          <span class="cat-val">${formatCurrency(s.value, true)}</span>
          <span class="cat-pct">${s.pct.toFixed(1)}%</span>
        </div>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------------------
  // Pure Canvas Charts: Channel Performance Bar Chart
  // -------------------------------------------------------------------------
  let channelBarPoints = [];

  function aggregateChannelData(transactions) {
    const channels = ['Direct Sales', 'Inside Sales', 'Inbound Web', 'Partner Referral'];
    const map = new Map();
    channels.forEach(c => map.set(c, { revenue: 0, count: 0 }));

    transactions.forEach(t => {
      if (t.status === 'Completed' || t.status === 'Processing') {
        const c = t.channel || 'Direct Sales';
        if (!map.has(c)) map.set(c, { revenue: 0, count: 0 });
        const obj = map.get(c);
        obj.revenue += Number(t.amount) || 0;
        obj.count += 1;
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      count: data.count
    }));
  }

  function renderChannelBarChart(channelData) {
    const canvas = DOM.channelCanvas;
    const ctx = canvas.getContext('2d');
    const container = DOM.channelContainer;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    DOM.channelCountBadge.textContent = `${channelData.length} Channels`;

    const maxVal = Math.max(...channelData.map(c => c.revenue), 2000);
    const padLeft = 55;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 38;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines
    const gridRows = 3;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridRows; i++) {
      const yVal = ((maxVal) / gridRows) * (gridRows - i);
      const yPos = padTop + (chartH / gridRows) * i;

      ctx.strokeStyle = PALETTE.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      ctx.fillStyle = PALETTE.textMuted;
      ctx.fillText(formatCurrency(yVal, true), padLeft - 8, yPos);
    }

    // Draw Bars
    const barCount = channelData.length;
    const slotW = chartW / barCount;
    const barWidth = Math.min(46, slotW * 0.55);

    channelBarPoints = [];

    channelData.forEach((item, index) => {
      const barHeight = maxVal > 0 ? (item.revenue / maxVal) * chartH : 0;
      const x = padLeft + (index * slotW) + (slotW - barWidth) / 2;
      const y = padTop + chartH - barHeight;

      const isHovered = state.canvasHoverBarIndex === index;

      // Draw rounded rectangle for bar
      ctx.fillStyle = isHovered ? '#60a5fa' : '#2563eb';
      drawRoundedRect(ctx, x, y, barWidth, Math.max(3, barHeight), 5);
      ctx.fill();

      // Channel label
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = PALETTE.textLight;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const shortName = item.name.replace(' Sales', '');
      ctx.fillText(shortName, x + barWidth / 2, padTop + chartH + 10);

      channelBarPoints.push({
        index,
        x,
        y,
        w: barWidth,
        h: barHeight,
        item
      });
    });
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // -------------------------------------------------------------------------
  // Sales Rep Leaderboard
  // -------------------------------------------------------------------------
  function renderLeaderboard(transactions) {
    const repMap = new Map();

    transactions.forEach(t => {
      if (t.status === 'Completed' || t.status === 'Processing') {
        const rep = t.rep || 'Unassigned';
        if (!repMap.has(rep)) repMap.set(rep, { revenue: 0, deals: 0 });
        const obj = repMap.get(rep);
        obj.revenue += Number(t.amount) || 0;
        obj.deals += 1;
      }
    });

    const list = Array.from(repMap.entries())
      .map(([name, data]) => ({ name, revenue: data.revenue, deals: data.deals }))
      .sort((a, b) => b.revenue - a.revenue);

    const maxRev = list.length > 0 ? list[0].revenue : 1;

    if (list.length === 0) {
      DOM.salesRepLeaderboard.innerHTML = '<div style="color:#64748b;font-size:0.8rem;text-align:center;padding:20px;">No closed sales recorded in this period</div>';
      return;
    }

    DOM.salesRepLeaderboard.innerHTML = list.map((rep, idx) => {
      const pct = maxRev > 0 ? Math.min(100, Math.round((rep.revenue / maxRev) * 100)) : 0;
      const initials = rep.name.split(' ').map(n => n[0]).join('');

      return `
        <div class="rep-item">
          <div class="rep-header">
            <div class="rep-profile">
              <span class="rep-avatar">${initials}</span>
              <div>
                <span class="rep-name">${escapeHtml(rep.name)}</span>
                <span class="rep-deal-count">&bull; ${rep.deals} deals</span>
              </div>
            </div>
            <div class="rep-metrics">
              <span class="rep-revenue">${formatCurrency(rep.revenue)}</span>
            </div>
          </div>
          <div class="rep-bar-wrap">
            <div class="rep-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------------------
  // Data Table & Pagination
  // -------------------------------------------------------------------------
  function filterAndSortTransactions() {
    const { start, end } = getDateRangeBoundaries();

    return state.transactions.filter(t => {
      // Date filter
      const d = new Date(t.date);
      if (d < start || d > end) return false;

      // Category filter
      if (state.categoryFilter !== 'ALL' && t.category !== state.categoryFilter) return false;

      // Status filter
      if (state.statusFilter !== 'ALL' && t.status !== state.statusFilter) return false;

      // Search query (matches invoice ID, customer, email, product, rep)
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const matchesId = (t.id || '').toLowerCase().includes(q);
        const matchesCust = (t.customer || '').toLowerCase().includes(q);
        const matchesEmail = (t.email || '').toLowerCase().includes(q);
        const matchesProd = (t.product || '').toLowerCase().includes(q);
        const matchesRep = (t.rep || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCust && !matchesEmail && !matchesProd && !matchesRep) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (state.sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount-asc':
          return (Number(a.amount) || 0) - (Number(b.amount) || 0);
        case 'amount-desc':
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        case 'customer-asc':
          return (a.customer || '').localeCompare(b.customer || '');
        case 'customer-desc':
          return (b.customer || '').localeCompare(a.customer || '');
        case 'id-asc':
          return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
        case 'id-desc':
          return (b.id || '').localeCompare(a.id || '', undefined, { numeric: true });
        case 'product-asc':
          return (a.product || '').localeCompare(b.product || '');
        case 'product-desc':
          return (b.product || '').localeCompare(a.product || '');
        case 'channel-asc':
          return (a.channel || '').localeCompare(b.channel || '');
        case 'channel-desc':
          return (b.channel || '').localeCompare(a.channel || '');
        case 'status-asc':
          return (a.status || '').localeCompare(b.status || '');
        case 'status-desc':
          return (b.status || '').localeCompare(a.status || '');
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }

  function renderTable() {
    const filtered = filterAndSortTransactions();
    const totalItems = filtered.length;

    DOM.filteredCountBadge.textContent = `${totalItems} records`;

    if (totalItems === 0) {
      DOM.transactionsTableBody.innerHTML = '';
      DOM.tableEmptyState.classList.remove('hidden');
      DOM.tablePaginationFooter.classList.add('hidden');
      return;
    }

    DOM.tableEmptyState.classList.add('hidden');
    DOM.tablePaginationFooter.classList.remove('hidden');

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, totalItems);
    const pageItems = filtered.slice(startIndex, endIndex);

    DOM.pageRangeStart.textContent = (startIndex + 1).toLocaleString();
    DOM.pageRangeEnd.textContent = endIndex.toLocaleString();
    DOM.pageTotalItems.textContent = totalItems.toLocaleString();

    // Render Table Rows
    DOM.transactionsTableBody.innerHTML = pageItems.map(t => {
      const statusClass = `status-${(t.status || 'completed').toLowerCase()}`;

      return `
        <tr data-id="${escapeHtml(t.id)}">
          <td>
            <span class="invoice-cell view-tx-action" data-id="${escapeHtml(t.id)}">${escapeHtml(t.id)}</span>
          </td>
          <td>
            <div class="customer-cell">
              <span class="customer-name">${escapeHtml(t.customer)}</span>
              <span class="customer-email">${escapeHtml(t.email || '')}</span>
            </div>
          </td>
          <td>
            <div class="product-cell">
              <span class="product-title">${escapeHtml(t.product)}</span>
              <span class="product-cat">${escapeHtml(t.category)}</span>
            </div>
          </td>
          <td class="date-cell">${formatShortDate(t.date)}</td>
          <td>
            <div class="channel-cell">
              <span class="channel-name">${escapeHtml(t.channel)}</span>
              <span class="rep-sub">${escapeHtml(t.rep)}</span>
            </div>
          </td>
          <td class="amount-cell">${formatCurrency(t.amount)}</td>
          <td>
            <span class="status-pill ${statusClass}">${escapeHtml(t.status)}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn view-tx-action" data-id="${escapeHtml(t.id)}" title="View Receipt">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button type="button" class="action-btn edit-tx-action" data-id="${escapeHtml(t.id)}" title="Edit Record">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </button>
              <button type="button" class="action-btn action-btn-danger delete-tx-action" data-id="${escapeHtml(t.id)}" title="Delete Record">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderPaginationControls(totalPages);
  }

  function renderPaginationControls(totalPages) {
    DOM.prevPageBtn.disabled = state.currentPage <= 1;
    DOM.nextPageBtn.disabled = state.currentPage >= totalPages;

    let html = '';
    const maxVisible = 5;
    let startP = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endP = Math.min(totalPages, startP + maxVisible - 1);

    if (endP - startP + 1 < maxVisible) {
      startP = Math.max(1, endP - maxVisible + 1);
    }

    for (let p = startP; p <= endP; p++) {
      html += `<button type="button" class="page-num-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }

    DOM.pageNumbersGroup.innerHTML = html;
  }

  // Populate dynamic category dropdown
  function populateCategoryOptions() {
    const cats = new Set(Object.keys(CATEGORY_COLORS));
    state.transactions.forEach(t => {
      if (t.category) cats.add(t.category);
    });

    const optionsHtml = '<option value="ALL">All Categories</option>' +
      Array.from(cats).sort().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

    DOM.filterCategory.innerHTML = optionsHtml;
  }

  // -------------------------------------------------------------------------
  // Master Dashboard Refresh Cycle
  // -------------------------------------------------------------------------
  function updateDashboard() {
    const { start, end, priorStart, priorEnd } = getDateRangeBoundaries();

    // Filter current vs prior
    const currentTx = getTransactionsInDateRange(start, end);
    const priorTx = priorStart && priorEnd ? getTransactionsInDateRange(priorStart, priorEnd) : null;

    // 1. KPIs
    const kpis = computeKPIs(currentTx, priorTx);
    renderKPIs(kpis);

    // 2. Timeline Chart
    const timelineData = aggregateTimelineData(currentTx, start, end);
    renderTimelineChart(timelineData);

    // 3. Category Donut Chart
    const catData = aggregateCategoryData(currentTx);
    renderCategoryDonut(catData);

    // 4. Channel Bar Chart
    const channelData = aggregateChannelData(currentTx);
    renderChannelBarChart(channelData);

    // 5. Leaderboard
    renderLeaderboard(currentTx);

    // 6. Data Table
    renderTable();
  }

  // -------------------------------------------------------------------------
  // Modals & Forms
  // -------------------------------------------------------------------------
  function openAddSaleModal(existingTx = null) {
    DOM.saleForm.reset();
    clearFormErrors();

    if (existingTx) {
      state.activeEditId = existingTx.id;
      DOM.modalTitle.textContent = `Edit Sale (${existingTx.id})`;
      DOM.saveBtnText.textContent = 'Update Record';
      DOM.saleFormId.value = existingTx.id;

      DOM.formCustomerName.value = existingTx.customer || '';
      DOM.formCustomerEmail.value = existingTx.email || '';
      DOM.formProductName.value = existingTx.product || '';
      DOM.formCategory.value = existingTx.category || 'SaaS Subscriptions';
      DOM.formAmount.value = existingTx.amount || '';
      DOM.formCost.value = existingTx.cost || '';
      DOM.formChannel.value = existingTx.channel || 'Direct Sales';
      DOM.formRep.value = existingTx.rep || 'Elena Rostova';
      DOM.formPaymentMethod.value = existingTx.paymentMethod || 'ACH / Bank Wire';
      DOM.formStatus.value = existingTx.status || 'Completed';

      // Format for datetime-local (YYYY-MM-DDTHH:MM)
      if (existingTx.date) {
        const d = new Date(existingTx.date);
        DOM.formDate.value = d.toISOString().slice(0, 16);
      }
    } else {
      state.activeEditId = null;
      DOM.modalTitle.textContent = 'Record New Sale';
      DOM.saveBtnText.textContent = 'Save Transaction';
      DOM.saleFormId.value = '';

      // Set default date to current simulated time
      const now = new Date();
      now.setSeconds(0, 0);
      DOM.formDate.value = now.toISOString().slice(0, 16);
      DOM.formCost.value = '';
    }

    DOM.saleModalOverlay.classList.remove('hidden');
    DOM.formCustomerName.focus();
  }

  function closeSaleModal() {
    DOM.saleModalOverlay.classList.add('hidden');
    state.activeEditId = null;
  }

  function clearFormErrors() {
    ['errCustomerName', 'errCustomerEmail', 'errProductName', 'errAmount', 'errDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
  }

  function handleSaveSale(e) {
    e.preventDefault();
    clearFormErrors();

    const name = DOM.formCustomerName.value.trim();
    const email = DOM.formCustomerEmail.value.trim();
    const product = DOM.formProductName.value.trim();
    const category = DOM.formCategory.value;
    const amountVal = parseFloat(DOM.formAmount.value);
    const costVal = parseFloat(DOM.formCost.value) || Math.round(amountVal * 0.25 * 100) / 100;
    const channel = DOM.formChannel.value;
    const rep = DOM.formRep.value;
    const paymentMethod = DOM.formPaymentMethod.value;
    const status = DOM.formStatus.value;
    const dateVal = DOM.formDate.value;

    let hasError = false;

    if (!name) {
      showFieldError('errCustomerName', 'Customer name is required');
      hasError = true;
    }
    if (!email || !email.includes('@')) {
      showFieldError('errCustomerEmail', 'Valid email address is required');
      hasError = true;
    }
    if (!product) {
      showFieldError('errProductName', 'Product / Service name is required');
      hasError = true;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      showFieldError('errAmount', 'Valid positive amount is required');
      hasError = true;
    }
    if (!dateVal) {
      showFieldError('errDate', 'Transaction date is required');
      hasError = true;
    }

    if (hasError) return;

    if (state.activeEditId) {
      // Update existing
      const index = state.transactions.findIndex(t => t.id === state.activeEditId);
      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          customer: name,
          email: email,
          product: product,
          category: category,
          amount: amountVal,
          cost: costVal,
          channel: channel,
          rep: rep,
          paymentMethod: paymentMethod,
          status: status,
          date: new Date(dateVal).toISOString()
        };
        saveTransactions(state.transactions);
        showToast('Sale Updated', `Invoice ${state.activeEditId} has been updated.`, 'success');
      }
    } else {
      // Add new
      const nextId = 'INV-' + (Math.floor(1000 + Math.random() * 9000));
      const newTx = {
        id: nextId,
        date: new Date(dateVal).toISOString(),
        customer: name,
        email: email,
        product: product,
        category: category,
        amount: amountVal,
        cost: costVal,
        channel: channel,
        rep: rep,
        paymentMethod: paymentMethod,
        status: status
      };

      state.transactions.unshift(newTx);
      saveTransactions(state.transactions);
      showToast('Sale Created', `Transaction ${nextId} recorded successfully.`, 'success');
    }

    closeSaleModal();
    populateCategoryOptions();
    updateDashboard();
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  // Invoice Details Modal
  function openDetailsModal(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    state.selectedInvoiceId = txId;
    DOM.detailsInvoiceId.textContent = tx.id;
    DOM.detailsStatusBadge.className = `status-pill status-${(tx.status || 'completed').toLowerCase()}`;
    DOM.detailsStatusBadge.textContent = tx.status;

    const netVal = Math.max(0, (tx.amount || 0) - (tx.cost || 0));
    const marginPct = tx.amount > 0 ? ((netVal / tx.amount) * 100).toFixed(1) : 0;

    DOM.invoiceSheetContent.innerHTML = `
      <div class="sheet-section">
        <div class="sheet-card-meta">
          <div class="meta-box">
            <span class="meta-title">Billed To</span>
            <span class="meta-val" style="color:#ffffff; font-weight:600;">${escapeHtml(tx.customer)}</span>
            <span class="meta-val">${escapeHtml(tx.email || 'N/A')}</span>
          </div>
          <div class="meta-box">
            <span class="meta-title">Transaction Date</span>
            <span class="meta-val">${formatFullDateTime(tx.date)}</span>
          </div>
          <div class="meta-box">
            <span class="meta-title">Sales Channel</span>
            <span class="meta-val">${escapeHtml(tx.channel || 'Direct')}</span>
          </div>
          <div class="meta-box">
            <span class="meta-title">Account Executive</span>
            <span class="meta-val">${escapeHtml(tx.rep || 'N/A')}</span>
          </div>
        </div>
      </div>

      <div class="sheet-section">
        <div class="sheet-row">
          <span class="sheet-label">Product / Service</span>
          <span class="sheet-val">${escapeHtml(tx.product)}</span>
        </div>
        <div class="sheet-row">
          <span class="sheet-label">Category</span>
          <span class="sheet-val">${escapeHtml(tx.category)}</span>
        </div>
        <div class="sheet-row">
          <span class="sheet-label">Payment Method</span>
          <span class="sheet-val">${escapeHtml(tx.paymentMethod || 'ACH')}</span>
        </div>
        <div class="sheet-divider"></div>
        <div class="sheet-row">
          <span class="sheet-label">Estimated Delivery Cost</span>
          <span class="sheet-val">${formatCurrency(tx.cost || 0)}</span>
        </div>
        <div class="sheet-row">
          <span class="sheet-label">Net Realized Profit</span>
          <span class="sheet-val" style="color:#34d399;">${formatCurrency(netVal)} (${marginPct}%)</span>
        </div>
        <div class="sheet-divider"></div>
        <div class="sheet-total-row">
          <span class="sheet-total-label">Gross Amount</span>
          <span class="sheet-total-val">${formatCurrency(tx.amount)}</span>
        </div>
      </div>
    `;

    DOM.detailsModalOverlay.classList.remove('hidden');
  }

  function closeDetailsModal() {
    DOM.detailsModalOverlay.classList.add('hidden');
    state.selectedInvoiceId = null;
  }

  function deleteTransaction(txId) {
    if (!confirm(`Are you sure you want to permanently delete transaction ${txId}?`)) {
      return;
    }

    state.transactions = state.transactions.filter(t => t.id !== txId);
    saveTransactions(state.transactions);
    showToast('Record Deleted', `Invoice ${txId} was removed from the ledger.`, 'warning');

    if (state.selectedInvoiceId === txId) {
      closeDetailsModal();
    }

    updateDashboard();
  }

  // -------------------------------------------------------------------------
  // CSV Export & Data Reset
  // -------------------------------------------------------------------------
  function exportToCSV() {
    const filtered = filterAndSortTransactions();
    if (filtered.length === 0) {
      showToast('Export Notice', 'No transaction rows to export', 'info');
      return;
    }

    const headers = ['Invoice ID', 'Date', 'Customer', 'Email', 'Product', 'Category', 'Amount USD', 'Cost USD', 'Channel', 'Representative', 'Payment Method', 'Status'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      `"${(t.customer || '').replace(/"/g, '""')}"`,
      `"${(t.email || '').replace(/"/g, '""')}"`,
      `"${(t.product || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      t.cost || 0,
      `"${(t.channel || '').replace(/"/g, '""')}"`,
      `"${(t.rep || '').replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SalesPulse_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Complete', `Exported ${filtered.length} transactions to CSV.`, 'success');
  }

  function resetToSampleData() {
    if (!confirm('Reset dashboard to default sample sales records? Any custom additions will be restored to factory demo state.')) {
      return;
    }

    const fresh = generateDefaultSeedData();
    state.transactions = fresh;
    saveTransactions(fresh);
    state.datePreset = '30d';
    state.searchQuery = '';
    state.categoryFilter = 'ALL';
    state.statusFilter = 'ALL';
    state.currentPage = 1;

    // Reset date buttons UI
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === '30d');
    });

    populateCategoryOptions();
    updateDashboard();
    showToast('Data Restored', 'Sample sales dataset refreshed successfully.', 'info');
  }

  // -------------------------------------------------------------------------
  // Toast Notification System
  // -------------------------------------------------------------------------
  function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
    `;

    DOM.toastStack.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  // -------------------------------------------------------------------------
  // Interactive Chart Tooltip & Canvas Listeners
  // -------------------------------------------------------------------------
  function setupChartInteractivity() {
    // 1. Timeline Canvas Mouse Move
    DOM.revenueCanvas.addEventListener('mousemove', e => {
      if (!timelineChartDataPoints.length) return;
      const rect = DOM.revenueCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let nearestIndex = 0;
      let minDistance = Infinity;

      timelineChartDataPoints.forEach((pt, idx) => {
        const dist = Math.abs(pt.x - mouseX);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = idx;
        }
      });

      state.canvasHoverLineIndex = nearestIndex;
      const pt = timelineChartDataPoints[nearestIndex];

      // Update Tooltip
      const valStr = state.timelineMetric === 'revenue'
        ? formatCurrency(pt.data.revenue)
        : `${pt.data.orders} order(s)`;

      const dateStr = pt.data.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      DOM.revenueTooltip.innerHTML = `<strong>${dateStr}</strong><br>${state.timelineMetric === 'revenue' ? 'Revenue' : 'Volume'}: ${valStr}`;
      DOM.revenueTooltip.style.opacity = '1';
      DOM.revenueTooltip.style.left = `${pt.x}px`;
      DOM.revenueTooltip.style.top = `${pt.y}px`;

      // Re-render highlight
      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      const timelineData = aggregateTimelineData(currentTx, start, end);
      renderTimelineChart(timelineData);
    });

    DOM.revenueCanvas.addEventListener('mouseleave', () => {
      state.canvasHoverLineIndex = null;
      DOM.revenueTooltip.style.opacity = '0';
      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      const timelineData = aggregateTimelineData(currentTx, start, end);
      renderTimelineChart(timelineData);
    });

    // 2. Donut Canvas Mouse Move
    DOM.categoryDonutCanvas.addEventListener('mousemove', e => {
      if (!donutSlices.length) return;
      const rect = DOM.categoryDonutCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50 || distance > 95) {
        if (state.canvasHoverDonutSlice !== null) {
          state.canvasHoverDonutSlice = null;
          DOM.donutTooltip.style.opacity = '0';
          const { start, end } = getDateRangeBoundaries();
          const currentTx = getTransactionsInDateRange(start, end);
          renderCategoryDonut(aggregateCategoryData(currentTx));
        }
        return;
      }

      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) angle += Math.PI * 2; // Normalize to match slice angles

      let found = null;
      for (const slice of donutSlices) {
        if (angle >= slice.startAngle && angle <= slice.endAngle) {
          found = slice;
          break;
        }
      }

      if (found) {
        state.canvasHoverDonutSlice = found.index;
        DOM.donutTooltip.innerHTML = `<strong>${escapeHtml(found.name)}</strong><br>${formatCurrency(found.value)} (${found.pct.toFixed(1)}%)`;
        DOM.donutTooltip.style.opacity = '1';
        DOM.donutTooltip.style.left = `${mouseX}px`;
        DOM.donutTooltip.style.top = `${mouseY}px`;
      } else {
        state.canvasHoverDonutSlice = null;
        DOM.donutTooltip.style.opacity = '0';
      }

      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      renderCategoryDonut(aggregateCategoryData(currentTx));
    });

    DOM.categoryDonutCanvas.addEventListener('mouseleave', () => {
      state.canvasHoverDonutSlice = null;
      DOM.donutTooltip.style.opacity = '0';
      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      renderCategoryDonut(aggregateCategoryData(currentTx));
    });

    // 3. Channel Bar Mouse Move
    DOM.channelCanvas.addEventListener('mousemove', e => {
      if (!channelBarPoints.length) return;
      const rect = DOM.channelCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let hovered = null;
      channelBarPoints.forEach(bar => {
        if (mouseX >= bar.x && mouseX <= bar.x + bar.w && mouseY >= bar.y && mouseY <= bar.y + bar.h + 10) {
          hovered = bar;
        }
      });

      if (hovered) {
        state.canvasHoverBarIndex = hovered.index;
        DOM.channelTooltip.innerHTML = `<strong>${escapeHtml(hovered.item.name)}</strong><br>${formatCurrency(hovered.item.revenue)} (${hovered.item.count} closed)`;
        DOM.channelTooltip.style.opacity = '1';
        DOM.channelTooltip.style.left = `${hovered.x + hovered.w / 2}px`;
        DOM.channelTooltip.style.top = `${hovered.y}px`;
      } else {
        state.canvasHoverBarIndex = null;
        DOM.channelTooltip.style.opacity = '0';
      }

      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      renderChannelBarChart(aggregateChannelData(currentTx));
    });

    DOM.channelCanvas.addEventListener('mouseleave', () => {
      state.canvasHoverBarIndex = null;
      DOM.channelTooltip.style.opacity = '0';
      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      renderChannelBarChart(aggregateChannelData(currentTx));
    });
  }

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  function setupEventListeners() {
    // Window Resize -> Re-render canvas responsive dimensions
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateDashboard();
      }, 100);
    });

    // Date Preset Buttons
    DOM.datePresetGroup.addEventListener('click', e => {
      const btn = e.target.closest('.preset-btn');
      if (!btn) return;
      const preset = btn.dataset.preset;
      state.datePreset = preset;

      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.currentPage = 1;
      updateDashboard();
    });

    // Custom Date Range
    DOM.applyCustomDateBtn.addEventListener('click', () => {
      const s = DOM.startDate.value;
      const e = DOM.endDate.value;
      if (!s || !e) {
        showToast('Filter Warning', 'Please select both start and end dates', 'warning');
        return;
      }
      if (new Date(s) > new Date(e)) {
        showToast('Filter Warning', 'Start date cannot be after end date', 'warning');
        return;
      }

      state.datePreset = 'custom';
      state.customStartDate = s;
      state.customEndDate = e;

      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      state.currentPage = 1;
      updateDashboard();
      showToast('Date Range Applied', `${s} to ${e}`, 'info');
    });

    // Timeline Metric Toggle (Revenue vs Orders)
    DOM.timelineMetricToggle.addEventListener('click', e => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      const metric = btn.dataset.metric;
      state.timelineMetric = metric;

      DOM.timelineMetricToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const { start, end } = getDateRangeBoundaries();
      const currentTx = getTransactionsInDateRange(start, end);
      renderTimelineChart(aggregateTimelineData(currentTx, start, end));
    });

    // Search Input
    DOM.tableSearchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.classList.toggle('hidden', state.searchQuery === '');
      state.currentPage = 1;
      renderTable();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.tableSearchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      state.currentPage = 1;
      renderTable();
    });

    // Category Filter
    DOM.filterCategory.addEventListener('change', e => {
      state.categoryFilter = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    // Status Filter
    DOM.filterStatus.addEventListener('change', e => {
      state.statusFilter = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    // Sort Dropdown
    DOM.sortBySelect.addEventListener('change', e => {
      state.sortBy = e.target.value;
      renderTable();
    });

    // Table Header Click Sorting
    DOM.transactionsTable.querySelector('thead').addEventListener('click', e => {
      const th = e.target.closest('.th-sortable');
      if (!th) return;
      const field = th.dataset.sort;
      if (!field) return;

      const [currentField, currentDir] = state.sortBy.split('-');
      if (currentField === field) {
        state.sortBy = `${field}-${currentDir === 'asc' ? 'desc' : 'asc'}`;
      } else {
        state.sortBy = `${field}-${field === 'amount' || field === 'date' ? 'desc' : 'asc'}`;
      }

      if (DOM.sortBySelect.querySelector(`option[value="${state.sortBy}"]`)) {
        DOM.sortBySelect.value = state.sortBy;
      }

      state.currentPage = 1;
      renderTable();
    });

    // Reset Table Filters Button
    DOM.resetTableFiltersBtn.addEventListener('click', () => {
      DOM.tableSearchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.filterCategory.value = 'ALL';
      DOM.filterStatus.value = 'ALL';
      state.searchQuery = '';
      state.categoryFilter = 'ALL';
      state.statusFilter = 'ALL';
      state.currentPage = 1;
      renderTable();
    });

    // Table Pagination
    DOM.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
      }
    });

    DOM.nextPageBtn.addEventListener('click', () => {
      state.currentPage++;
      renderTable();
    });

    DOM.pageNumbersGroup.addEventListener('click', e => {
      const btn = e.target.closest('.page-num-btn');
      if (!btn) return;
      state.currentPage = parseInt(btn.dataset.page, 10);
      renderTable();
    });

    // Table Row Action Delegations
    DOM.transactionsTableBody.addEventListener('click', e => {
      const viewBtn = e.target.closest('.view-tx-action');
      if (viewBtn) {
        openDetailsModal(viewBtn.dataset.id);
        return;
      }

      const editBtn = e.target.closest('.edit-tx-action');
      if (editBtn) {
        const tx = state.transactions.find(t => t.id === editBtn.dataset.id);
        if (tx) openAddSaleModal(tx);
        return;
      }

      const deleteBtn = e.target.closest('.delete-tx-action');
      if (deleteBtn) {
        deleteTransaction(deleteBtn.dataset.id);
        return;
      }
    });

    // Header Actions
    DOM.openAddSaleModalBtn.addEventListener('click', () => openAddSaleModal());
    DOM.closeSaleModalBtn.addEventListener('click', closeSaleModal);
    DOM.cancelSaleFormBtn.addEventListener('click', closeSaleModal);
    DOM.saleForm.addEventListener('submit', handleSaveSale);

    DOM.closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    DOM.detailsCloseBtn.addEventListener('click', closeDetailsModal);

    DOM.detailsEditBtn.addEventListener('click', () => {
      if (!state.selectedInvoiceId) return;
      const tx = state.transactions.find(t => t.id === state.selectedInvoiceId);
      closeDetailsModal();
      if (tx) openAddSaleModal(tx);
    });

    DOM.detailsDeleteBtn.addEventListener('click', () => {
      if (!state.selectedInvoiceId) return;
      deleteTransaction(state.selectedInvoiceId);
    });

    DOM.exportCsvBtn.addEventListener('click', exportToCSV);
    DOM.resetDataBtn.addEventListener('click', resetToSampleData);

    // Close modals on overlay backdrop click
    [DOM.saleModalOverlay, DOM.detailsModalOverlay].forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    // Escape key closes modals
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        DOM.saleModalOverlay.classList.add('hidden');
        DOM.detailsModalOverlay.classList.add('hidden');
      }
    });
  }

  // -------------------------------------------------------------------------
  // Utility: HTML Escaping
  // -------------------------------------------------------------------------
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  function init() {
    state.transactions = loadTransactions();
    populateCategoryOptions();

    // Default dates for custom input pickers
    const now = getReferenceCurrentDate();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    DOM.startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    DOM.endDate.value = now.toISOString().split('T')[0];

    setupEventListeners();
    setupChartInteractivity();
    updateDashboard();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
