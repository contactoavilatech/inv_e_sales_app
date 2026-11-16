'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  CheckCircle,
  Barcode,
  Globe,
  Shield,
  Plus,
  AlertTriangle,
  DollarSign,
  Receipt,
  RotateCcw
} from 'lucide-react';




const TRANSLATIONS = {
  en: {
    brandSubtitle: 'Inventory, Barcode POS & Operations',
    profile: 'Profile',
    resetDemo: 'Reset Demo Data',
    roles: {
      VIEWER: 'VIEWER (Read Only)',
      OPERATOR: 'OPERATOR (Sales & Stock)',
      ADMIN: 'ADMIN (Full Access)',
    },
    tabs: {
      dashboard: 'Dashboard',
      inventory: 'Inventory (Ingredients & Products)',
      pos: 'Point of Sale (POS)',
      approvals: 'Approval Queue',
      audit: 'Audit Logs',
    },
    dashboard: {
      title: 'Executive Dashboard',
      totalIngredients: 'Total Ingredients',
      finishedProducts: 'Finished Products',
      lowStock: 'Low Stock Alerts',
      activeRole: 'Active Profile Role',
      recentSales: 'Recent Sales Transactions',
      noSales: 'No sales recorded yet. Use the Point of Sale tab to register a transaction.',
    },
    pos: {
      title: 'New Sales Transaction',
      subtitle: 'Register customer orders and automatically update inventory levels',
      selectProduct: 'Select Product',
      chooseOption: '-- Choose a product --',
      quantity: 'Quantity',
      customerName: 'Customer / Client Name',
      customerPlaceholder: 'e.g. Walk-in Client or Company Name',
      paymentMethod: 'Payment Method',
      methods: {
        cash: 'Cash (USD)',
        zelle: 'Zelle / Transfer',
        card: 'POS / Debit Card',
        pagoMovil: 'Pago Móvil',
      },
      unitPrice: 'Unit Price',
      totalAmount: 'Total Amount',
      submitSale: 'Complete Sale',
      readOnlyWarning: 'Switch profile to OPERATOR or ADMIN to register sales.',
      insufficientStock: 'Insufficient stock available for this quantity.',
      saleSuccess: 'Sale registered successfully!',
      cartSummary: 'Transaction Summary',
    },
    inventory: {
      title: 'Inventory Catalog & Registration',
      addSkuPlaceholder: 'SKU (e.g. AV-003)',
      addNamePlaceholder: 'Product Name',
      addStockPlaceholder: 'Initial Stock',
      addPricePlaceholder: 'Price ($)',
      addButton: '+ Register Item',
      sku: 'SKU / Barcode',
      name: 'Item Name',
      category: 'Category',
      stock: 'Current Stock',
      price: 'Unit Price',
      status: 'Status',
      inStock: 'In Stock',
      low: 'Low Stock',
      itemAdded: 'Product registered in inventory!',
    },
    audit: {
      title: 'System Audit Trail',
    },
  },
  es: {
    brandSubtitle: 'Inventario, Punto de Venta (POS) y Operaciones',
    profile: 'Perfil',
    resetDemo: 'Reiniciar Demo',
    roles: {
      VIEWER: 'OBSERVADOR (Solo Lectura)',
      OPERATOR: 'OPERADOR (Ventas y Stock)',
      ADMIN: 'ADMINISTRADOR (Acceso Total)',
    },
    tabs: {
      dashboard: 'Panel Ejecutivo',
      inventory: 'Inventario (Insumos y Productos)',
      pos: 'Punto de Venta (POS)',
      approvals: 'Cola de Aprobación',
      audit: 'Auditoría',
    },
    dashboard: {
      title: 'Panel Ejecutivo',
      totalIngredients: 'Total Insumos',
      finishedProducts: 'Productos Terminados',
      lowStock: 'Alertas de Bajo Stock',
      activeRole: 'Rol de Perfil Activo',
      recentSales: 'Transacciones de Venta Recientes',
      noSales: 'Aún no hay ventas registradas. Usa la pestaña Punto de Venta para registrar una.',
    },
    pos: {
      title: 'Nueva Transacción de Venta',
      subtitle: 'Registra pedidos de clientes y actualiza el inventario automáticamente',
      selectProduct: 'Seleccionar Producto',
      chooseOption: '-- Elige un producto --',
      quantity: 'Cantidad',
      customerName: 'Nombre del Cliente',
      customerPlaceholder: 'Ej. Cliente Mostrador o Empresa',
      paymentMethod: 'Método de Pago',
      methods: {
        cash: 'Efectivo (USD)',
        zelle: 'Zelle / Transferencia',
        card: 'Punto de Venta / Tarjeta',
        pagoMovil: 'Pago Móvil',
      },
      unitPrice: 'Precio Unitario',
      totalAmount: 'Monto Total',
      submitSale: 'Completar Venta',
      readOnlyWarning: 'Cambia el perfil a OPERADOR o ADMINISTRADOR para registrar ventas.',
      insufficientStock: 'Stock insuficiente para la cantidad solicitada.',
      saleSuccess: '¡Venta registrada exitosamente!',
      cartSummary: 'Resumen de Transacción',
    },
    inventory: {
      title: 'Catálogo y Registro de Inventario',
      addSkuPlaceholder: 'SKU (Ej. AV-003)',
      addNamePlaceholder: 'Nombre del Producto',
      addStockPlaceholder: 'Stock Inicial',
      addPricePlaceholder: 'Precio ($)',
      addButton: '+ Registrar Artículo',
      sku: 'SKU / Código',
      name: 'Nombre del Artículo',
      category: 'Categoría',
      stock: 'Stock Actual',
      price: 'Precio Unitario',
      status: 'Estado',
      inStock: 'Disponible',
      low: 'Stock Bajo',
      itemAdded: '¡Producto registrado en el inventario!',
    },
    audit: {
      title: 'Registro de Auditoría del Sistema',
    },
  },
};

const INITIAL_PRODUCTS = [
  { id: 1, sku: 'AV-PRD-001', name: 'Enterprise Router X1', category: 'Finished Product', stock: 14, minStock: 5, price: 120.00 },
  { id: 2, sku: 'AV-PRD-002', name: 'Fiber Optic Kit Pro', category: 'Finished Product', stock: 3, minStock: 5, price: 85.00 },
];

export default function AvilaTechERP() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('ADMIN');
  const [isHydrated, setIsHydrated] = useState(false);

  // Core Operational States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [ingredientsCount] = useState(3);
  const [sales, setSales] = useState([]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), role: 'SYSTEM', action: 'AvilaTech ERP initialized (Local + Supabase Hybrid Mode).' },
  ]);

  // New Product Registration States
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdPrice, setNewProdPrice] = useState('50');
  const [invFeedback, setInvFeedback] = useState('');

  // POS Sales Form States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [posFeedback, setPosFeedback] = useState({ type: '', message: '' });

  const t = TRANSLATIONS[lang];

  // Load saved localStorage data & attempt Supabase sync on startup
  useEffect(() => {
    const savedProducts = localStorage.getItem('avilatech_products');
    const savedSales = localStorage.getItem('avilatech_sales');
    const savedLogs = localStorage.getItem('avilatech_logs');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    setIsHydrated(true);

    async function syncFromSupabase() {
      try {
        const { data: prodData } = await supabase.from('products').select('*');
        if (prodData && prodData.length > 0 && !savedProducts) {
          setProducts(prodData);
        }
        const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        if (salesData && salesData.length > 0 && !savedSales) {
          setSales(salesData);
        }
      } catch (err) {
        // Hybrid fallback stays active locally
      }
    }
    syncFromSupabase();
  }, []);

  // Persist changes to localStorage automatically
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('avilatech_products', JSON.stringify(products));
    localStorage.setItem('avilatech_sales', JSON.stringify(sales));
    localStorage.setItem('avilatech_logs', JSON.stringify(auditLogs));
  }, [products, sales, auditLogs, isHydrated]);

  const selectedProduct = products.find((p) => String(p.id) === String(selectedProductId));
  const unitPrice = selectedProduct ? Number(selectedProduct.price) : 0;
  const totalAmount = unitPrice * Number(quantity || 0);
  const lowStockCount = products.filter((p) => p.stock <= (p.minStock || 5)).length;

  // Register New Inventory Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (role === 'VIEWER' || !newProdName.trim()) return;

    const newItem = {
      id: Date.now(),
      sku: newProdSku.trim() || `AV-PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: newProdName.trim(),
      category: 'Finished Product',
      stock: Number(newProdStock),
      minStock: 5,
      price: Number(newProdPrice),
    };

    setProducts([newItem, ...products]);
    setAuditLogs([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        role,
        action: `Inventory Added: ${newItem.name} (SKU: ${newItem.sku}, Stock: ${newItem.stock}, $${newItem.price.toFixed(2)})`,
      },
      ...auditLogs,
    ]);

    try {
      await supabase.from('products').insert([
        {
          sku: newItem.sku,
          name: newItem.name,
          category: newItem.category,
          stock: newItem.stock,
          min_stock: newItem.minStock,
          price: newItem.price,
        },
      ]);
    } catch (err) {}

    setNewProdSku('');
    setNewProdName('');
    setNewProdStock('10');
    setNewProdPrice('50');
    setInvFeedback(t.inventory.itemAdded);
    setTimeout(() => setInvFeedback(''), 3000);
  };

  // Register New POS Sale
  const handleCreateSale = async (e) => {
    e.preventDefault();
    setPosFeedback({ type: '', message: '' });

    if (role === 'VIEWER') {
      setPosFeedback({ type: 'error', message: t.pos.readOnlyWarning });
      return;
    }

    if (!selectedProduct) return;

    const qty = Number(quantity);
    if (qty <= 0 || qty > selectedProduct.stock) {
      setPosFeedback({ type: 'error', message: t.pos.insufficientStock });
      return;
    }

    const newSale = {
      id: Date.now(),
      product_name: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: qty,
      total: totalAmount,
      customer: customerName.trim() || (lang === 'en' ? 'Walk-in Client' : 'Cliente Mostrador'),
      payment_method: t.pos.methods[paymentMethod],
      created_at: new Date().toLocaleString(),
    };

    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, stock: p.stock - qty } : p
    );
    setProducts(updatedProducts);
    setSales([newSale, ...sales]);

    setAuditLogs([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        role,
        action: `POS Sale: ${qty}x ${selectedProduct.name} ($${totalAmount.toFixed(2)}) — ${newSale.customer}`,
      },
      ...auditLogs,
    ]);

    try {
      await supabase.from('sales').insert([
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: qty,
          total_amount: totalAmount,
          customer_name: newSale.customer,
          payment_method: paymentMethod,
        },
      ]);
      await supabase
        .from('products')
        .update({ stock: selectedProduct.stock - qty })
        .eq('id', selectedProduct.id);
    } catch (err) {}

    setSelectedProductId('');
    setQuantity(1);
    setCustomerName('');
    setPosFeedback({ type: 'success', message: t.pos.saleSuccess });
    setTimeout(() => setPosFeedback({ type: '', message: '' }), 3500);
  };


const [products, setProducts] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('avilatech_products');
    if (saved) return JSON.parse(saved);
  }
  return []; // Default initial state for server/first render
});


  // Reset Local Demo Storage
  const handleResetDemo = () => {
    if (role !== 'ADMIN') return;
    localStorage.removeItem('avilatech_products');
    localStorage.removeItem('avilatech_sales');
    localStorage.removeItem('avilatech_logs');
    setProducts(INITIAL_PRODUCTS);
    setSales([]);
    setAuditLogs([
      { id: Date.now(), time: new Date().toLocaleTimeString(), role: 'ADMIN', action: 'Demo local storage reset to baseline.' },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Enterprise Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
              AV
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AvilaTech ERP</h1>
              <p className="text-xs text-slate-400">{t.brandSubtitle}</p>
            </div>
          </div>

          {/* Controls: Language Toggle, Role Selector & Admin Reset */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-400 transition cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'ESPAÑOL' : 'ENGLISH'}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">{t.profile}:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="VIEWER" className="bg-slate-900">{t.roles.VIEWER}</option>
                <option value="OPERATOR" className="bg-slate-900">{t.roles.OPERATOR}</option>
                <option value="ADMIN" className="bg-slate-900">{t.roles.ADMIN}</option>
              </select>
            </div>

            {role === 'ADMIN' && (
              <button
                onClick={handleResetDemo}
                title={t.resetDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-xs text-slate-400 hover:text-rose-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.resetDemo}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 pb-3">
          {[
            { id: 'dashboard', label: t.tabs.dashboard, icon: TrendingUp },
            { id: 'inventory', label: t.tabs.inventory, icon: Package },
            { id: 'pos', label: t.tabs.pos, icon: ShoppingCart },
            { id: 'approvals', label: t.tabs.approvals, icon: CheckCircle },
            { id: 'audit', label: t.tabs.audit, icon: Barcode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">{t.dashboard.title}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold transition cursor-pointer"
                >
                  <Package className="w-4 h-4 text-cyan-400" />
                  {t.inventory.addButton}
                </button>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t.tabs.pos}
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-400">{t.dashboard.totalIngredients}</p>
                <p className="text-3xl font-bold text-white mt-2">{ingredientsCount}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-400">{t.dashboard.finishedProducts}</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{products.length}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-400">{t.dashboard.lowStock}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-amber-400">{lowStockCount}</p>
                  {lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-400">{t.dashboard.activeRole}</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {role}
                </span>
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                {t.dashboard.recentSales}
              </h3>

              {sales.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-800 rounded-xl">
                  {t.dashboard.noSales}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="pb-3 font-medium">SKU</th>
                        <th className="pb-3 font-medium">{t.inventory.name}</th>
                        <th className="pb-3 font-medium">{t.pos.customerName}</th>
                        <th className="pb-3 font-medium">{t.pos.quantity}</th>
                        <th className="pb-3 font-medium">{t.pos.paymentMethod}</th>
                        <th className="pb-3 font-medium text-right">{t.pos.totalAmount}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-800/40">
                          <td className="py-3 font-mono text-xs text-slate-400">{sale.sku}</td>
                          <td className="py-3 font-medium text-white">{sale.product_name}</td>
                          <td className="py-3 text-slate-300">{sale.customer}</td>
                          <td className="py-3 text-slate-300">{sale.quantity}</td>
                          <td className="py-3 text-xs text-cyan-400">{sale.payment_method}</td>
                          <td className="py-3 text-right font-bold text-emerald-400">
                            ${Number(sale.total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & PRODUCT REGISTRATION */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{t.inventory.title}</h2>
              {invFeedback && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {invFeedback}
                </span>
              )}
            </div>

            {/* Product Registration Form (OPERATOR & ADMIN) */}
            {role !== 'VIEWER' && (
              <form
                onSubmit={handleAddProduct}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3"
              >
                <input
                  type="text"
                  placeholder={t.inventory.addSkuPlaceholder}
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder={t.inventory.addNamePlaceholder}
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  required
                  placeholder={t.inventory.addStockPlaceholder}
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder={t.inventory.addPricePlaceholder}
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {t.inventory.addButton}
                </button>
              </form>
            )}

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">{t.inventory.sku}</th>
                    <th className="pb-3 font-medium">{t.inventory.name}</th>
                    <th className="pb-3 font-medium">{t.inventory.category}</th>
                    <th className="pb-3 font-medium">{t.inventory.stock}</th>
                    <th className="pb-3 font-medium">{t.inventory.price}</th>
                    <th className="pb-3 font-medium">{t.inventory.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((item) => {
                    const isLow = item.stock <= (item.minStock || 5);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-4 font-mono text-xs text-cyan-400">{item.sku}</td>
                        <td className="py-4 font-semibold text-white">{item.name}</td>
                        <td className="py-4 text-slate-400">{item.category}</td>
                        <td className="py-4 font-mono font-bold text-white">{item.stock}</td>
                        <td className="py-4 font-mono text-slate-300">${Number(item.price).toFixed(2)}</td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isLow ? t.inventory.low : t.inventory.inStock}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: POINT OF SALE (POS) & SALES FORM */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-indigo-400" />
                  {t.pos.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">{t.pos.subtitle}</p>
              </div>

              {role === 'VIEWER' && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{t.pos.readOnlyWarning}</span>
                </div>
              )}

              {posFeedback.message && (
                <div
                  className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                    posFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {posFeedback.message}
                </div>
              )}

              <form onSubmit={handleCreateSale} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t.pos.selectProduct}
                  </label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">{t.pos.chooseOption}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name} (${Number(p.price).toFixed(2)} | Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t.pos.quantity}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct ? selectedProduct.stock : 999}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t.pos.paymentMethod}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="cash">{t.pos.methods.cash}</option>
                      <option value="zelle">{t.pos.methods.zelle}</option>
                      <option value="card">{t.pos.methods.card}</option>
                      <option value="pagoMovil">{t.pos.methods.pagoMovil}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t.pos.customerName}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.pos.customerPlaceholder}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={role === 'VIEWER' || !selectedProductId}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5" />
                  {t.pos.submitSale}
                </button>
              </form>
            </div>

            {/* Live Order Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
                {t.pos.cartSummary}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>{t.pos.selectProduct}:</span>
                  <span className="text-white font-medium text-right">
                    {selectedProduct ? selectedProduct.name : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t.pos.unitPrice}:</span>
                  <span className="text-white font-mono">${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t.pos.quantity}:</span>
                  <span className="text-white font-mono">x{quantity || 0}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-300">{t.pos.totalAmount}</span>
                <span className="text-3xl font-bold text-emerald-400 font-mono">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPROVAL QUEUE */}
        {activeTab === 'approvals' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">{t.tabs.approvals}</h2>
            <p className="text-sm text-slate-400 mt-2">
              {lang === 'en'
                ? 'All inventory adjustments and POS transactions are currently up to date.'
                : 'Todos los ajustes de inventario y transacciones POS están al día.'}
            </p>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">{t.audit.title}</h2>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                      {log.role}
                    </span>
                    <span className="text-slate-200">{log.action}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}