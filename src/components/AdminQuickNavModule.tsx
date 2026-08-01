import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  RefreshCw,
  Layers,
  Smartphone,
  Monitor,
  Check,
  X,
  ExternalLink,
  Home,
  GraduationCap,
  FileEdit,
  ShieldCheck,
  CheckSquare,
  BookOpen,
  Award,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  Star,
  Laptop,
  Globe,
  Settings,
  Grid,
  FileText
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { QuickNavItem, QuickNavStatus } from '../types';

interface AdminQuickNavModuleProps {
  userRole?: string;
  onRefreshWebsiteNav?: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Home', label: 'Home', icon: Home },
  { name: 'GraduationCap', label: 'Graduation Cap', icon: GraduationCap },
  { name: 'FileEdit', label: 'File Edit / Form', icon: FileEdit },
  { name: 'ShieldCheck', label: 'Shield Check / Verification', icon: ShieldCheck },
  { name: 'Search', label: 'Search / Lookup', icon: Search },
  { name: 'CheckSquare', label: 'Check Square / Quiz', icon: CheckSquare },
  { name: 'Compass', label: 'Compass / Navigation', icon: Compass },
  { name: 'BookOpen', label: 'Book / Library', icon: BookOpen },
  { name: 'Award', label: 'Award / Certificate', icon: Award },
  { name: 'Sparkles', label: 'Sparkles / AI', icon: Sparkles },
  { name: 'Phone', label: 'Phone / Contact', icon: Phone },
  { name: 'Mail', label: 'Mail / Email', icon: Mail },
  { name: 'MapPin', label: 'Map Pin / Location', icon: MapPin },
  { name: 'Send', label: 'Send / Submit', icon: Send },
  { name: 'Star', label: 'Star / Featured', icon: Star },
  { name: 'Laptop', label: 'Laptop / Tech', icon: Laptop },
  { name: 'Globe', label: 'Globe / Portal', icon: Globe },
  { name: 'FileText', label: 'File Text / Notice', icon: FileText }
];

const COLOR_PRESETS = [
  { name: 'Blue & Indigo', value: 'from-blue-600 to-indigo-600', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60' },
  { name: 'Purple & Indigo', value: 'from-purple-600 to-indigo-600', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
  { name: 'Orange & Amber', value: 'from-orange-500 to-amber-600', text: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
  { name: 'Emerald & Teal', value: 'from-emerald-600 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
  { name: 'Cyan & Blue', value: 'from-cyan-600 to-blue-600', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60' },
  { name: 'Pink & Rose', value: 'from-pink-600 to-rose-600', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/60' }
];

export const AdminQuickNavModule: React.FC<AdminQuickNavModuleProps> = ({ userRole = 'admin', onRefreshWebsiteNav }) => {
  const [items, setItems] = useState<QuickNavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickNavItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    badge: 'Quick Access',
    description: '',
    icon: 'Compass',
    targetTab: 'home',
    isExternal: false,
    externalUrl: '',
    colorPresetIndex: 0,
    status: 'Published' as QuickNavStatus,
    showDesktop: true,
    showMobile: true
  });

  // Render dynamic icon helper
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Compass;
    return <IconComponent className={className} />;
  };

  // Fetch Quick Nav Items
  const fetchNavItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/quick-nav', {
        headers: { 'x-user-role': userRole }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load quick nav items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavItems();
  }, []);

  // Show notification toast
  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      badge: 'Quick Access',
      description: '',
      icon: 'Compass',
      targetTab: 'home',
      isExternal: false,
      externalUrl: '',
      colorPresetIndex: 0,
      status: 'Published',
      showDesktop: true,
      showMobile: true
    });
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: QuickNavItem) => {
    setEditingItem(item);
    const colorIdx = COLOR_PRESETS.findIndex(c => c.value === item.color) !== -1
      ? COLOR_PRESETS.findIndex(c => c.value === item.color)
      : 0;

    setFormData({
      title: item.title,
      badge: item.badge || 'Quick Access',
      description: item.description || '',
      icon: item.icon || 'Compass',
      targetTab: item.targetTab,
      isExternal: Boolean(item.isExternal),
      externalUrl: item.externalUrl || '',
      colorPresetIndex: colorIdx,
      status: item.status,
      showDesktop: item.showDesktop ?? true,
      showMobile: item.showMobile ?? true
    });
    setIsFormModalOpen(true);
  };

  // Submit Save or Update
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.targetTab.trim()) {
      showNotification('error', 'Title and Target Link are required.');
      return;
    }

    const preset = COLOR_PRESETS[formData.colorPresetIndex] || COLOR_PRESETS[0];

    const payload = {
      title: formData.title.trim(),
      badge: formData.badge.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      color: preset.value,
      textColor: preset.text,
      bgLight: preset.bg,
      targetTab: formData.targetTab.trim(),
      isExternal: formData.isExternal,
      externalUrl: formData.externalUrl.trim(),
      status: formData.status,
      showDesktop: formData.showDesktop,
      showMobile: formData.showMobile
    };

    try {
      if (editingItem) {
        // Update existing
        const res = await fetch(`/api/admin/quick-nav/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', `Quick Nav item "${formData.title}" updated successfully!`);
          setIsFormModalOpen(false);
          fetchNavItems();
          if (onRefreshWebsiteNav) onRefreshWebsiteNav();
        } else {
          showNotification('error', data.message || 'Failed to update item.');
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/quick-nav', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', `Quick Nav item "${formData.title}" published successfully!`);
          setIsFormModalOpen(false);
          fetchNavItems();
          if (onRefreshWebsiteNav) onRefreshWebsiteNav();
        } else {
          showNotification('error', data.message || 'Failed to create item.');
        }
      }
    } catch (err) {
      showNotification('error', 'Server error occurred.');
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (item: QuickNavItem) => {
    try {
      const res = await fetch(`/api/admin/quick-nav/${item.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        }
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `"${item.title}" status changed to ${data.status}`);
        fetchNavItems();
        if (onRefreshWebsiteNav) onRefreshWebsiteNav();
      }
    } catch (err) {
      showNotification('error', 'Failed to toggle status.');
    }
  };

  // Delete item
  const handleDeleteItem = async (item: QuickNavItem) => {
    if (!window.confirm(`Are you sure you want to delete menu item "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/quick-nav/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole }
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `"${item.title}" deleted.`);
        fetchNavItems();
        if (onRefreshWebsiteNav) onRefreshWebsiteNav();
      }
    } catch (err) {
      showNotification('error', 'Failed to delete menu item.');
    }
  };

  // Move Up / Move Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setItems(newItems);

    const orderedIds = newItems.map(i => i.id);
    try {
      await fetch('/api/admin/quick-nav/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({ orderedIds })
      });
      showNotification('success', 'Menu order updated instantly!');
      if (onRefreshWebsiteNav) onRefreshWebsiteNav();
    } catch (err) {
      console.error('Failed to save order');
    }
  };

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetTab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Quick Navigation Manager
                </h2>
                <span className="text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  Menu Management
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Publish, edit, reorder, and manage quick access links across Desktop & Mobile views with real-time sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Preview Menu</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, badge or link..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-medium text-slate-500">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses ({items.length})</option>
              <option value="Published">Published ({items.filter(i => i.status === 'Published').length})</option>
              <option value="Unpublished">Unpublished ({items.filter(i => i.status === 'Unpublished').length})</option>
              <option value="Draft">Draft ({items.filter(i => i.status === 'Draft').length})</option>
            </select>

            <button
              onClick={fetchNavItems}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Menu List Table / Cards */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading Quick Navigation items from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Quick Navigation Items Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search filter query.' : 'Click "Add Menu Item" above to publish your first quick navigation link.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4">Menu Item Details</th>
                    <th className="py-3.5 px-4">Target Link / Tab</th>
                    <th className="py-3.5 px-4">Visibility</th>
                    <th className="py-3.5 px-4">Publish Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Order Controls */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="w-5 text-center text-slate-600 dark:text-slate-300">{item.displayOrder}</span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down')}
                              disabled={idx === filteredItems.length - 1}
                              className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Icon + Title + Description */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${item.bgLight || 'bg-blue-50'} flex items-center justify-center shrink-0`}>
                            <span className={item.textColor || 'text-blue-600'}>
                              {renderIcon(item.icon, 'w-5 h-5')}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target Link */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {item.isExternal ? <ExternalLink className="w-3 h-3 text-orange-500" /> : <Grid className="w-3 h-3 text-blue-500" />}
                          {item.targetTab}
                        </span>
                      </td>

                      {/* Visibility Badges */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.showDesktop
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            }`}
                          >
                            <Monitor className="w-3 h-3" /> Desktop
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.showMobile
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" /> Mobile
                          </span>
                        </div>
                      </td>

                      {/* Publish Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            item.status === 'Published'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {item.status === 'Published' ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                              Unpublished
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                          title="Edit Menu Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer"
                          title="Delete Menu Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingItem ? 'Edit Quick Navigation Item' : 'Add New Quick Navigation Item'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure title, badge, icon, target link, and responsive visibility.</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Menu Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Menu Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Online Practice Tests"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Badge Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. MCQ Prep / ISO Certified / Direct Enroll"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Text / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Take timed interactive online mock tests, practice quizzes, and instant score review."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Menu Icon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {AVAILABLE_ICONS.map((ico) => {
                    const isSelected = formData.icon === ico.name;
                    return (
                      <button
                        type="button"
                        key={ico.name}
                        onClick={() => setFormData({ ...formData, icon: ico.name })}
                        className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title={ico.label}
                      >
                        {renderIcon(ico.name, 'w-5 h-5')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Link & Tab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Tab Route / Action *
                  </label>
                  <select
                    value={formData.targetTab}
                    onChange={(e) => setFormData({ ...formData, targetTab: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="home">Home Page (home)</option>
                    <option value="courses">Course Catalog (courses)</option>
                    <option value="admission">Online Admission Form Modal (admission)</option>
                    <option value="verification">Verify Certificate (verification)</option>
                    <option value="results">Exam Results Lookup (results)</option>
                    <option value="mocktest">Online Practice Tests (mocktest)</option>
                    <option value="about">About Us (about)</option>
                    <option value="contact">Contact Us (contact)</option>
                    <option value="custom">Custom External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as QuickNavStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Unpublished">Unpublished (Hidden from Public)</option>
                    <option value="Draft">Draft (Internal Edit Mode)</option>
                  </select>
                </div>
              </div>

              {/* External Link Input if targetTab === 'custom' or isExternal */}
              {(formData.targetTab === 'custom' || formData.isExternal) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Card Color Theme Gradient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setFormData({ ...formData, colorPresetIndex: idx })}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                        formData.colorPresetIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/60'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${preset.value}`} />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{preset.name}</span>
                      </div>
                      {formData.colorPresetIndex === idx && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Visibility Toggles */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Responsive Visibility Controls
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showDesktop}
                      onChange={(e) => setFormData({ ...formData, showDesktop: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Monitor className="w-4 h-4 text-blue-500" /> Show on Desktop
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showMobile}
                      onChange={(e) => setFormData({ ...formData, showMobile: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <Smartphone className="w-4 h-4 text-purple-500" /> Show on Mobile
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Quick Navigation Menu Live Preview</h3>
                  <p className="text-[11px] text-slate-400">Website appearance preview for published navigation items.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900/90 max-h-[75vh] overflow-y-auto">
              <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-md bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl' : 'max-w-4xl'}`}>
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-3 py-1 rounded-full">
                      Quick Access Services
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Quick Navigation Menu</h3>
                  </div>

                  <div className={`grid gap-4 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {items
                      .filter(i => i.status === 'Published')
                      .filter(i => previewMode === 'desktop' ? i.showDesktop : i.showMobile)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl ${item.bgLight || 'bg-blue-50'} flex items-center justify-center`}>
                              <span className={item.textColor || 'text-blue-600'}>
                                {renderIcon(item.icon, 'w-5 h-5')}
                              </span>
                            </div>
                            {item.badge && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.bgLight || 'bg-blue-50'} ${item.textColor || 'text-blue-600'}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
