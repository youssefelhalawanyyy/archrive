import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Save, 
  Calendar, 
  Building2, 
  AlertCircle,
  Trash2 
} from 'lucide-react';

export default function EditSeparationModal({
  isOpen,
  onClose,
  separator,
  binders = [],
  onUpdateSeparator,
  onDeleteSeparator
}) {
  if (!isOpen || !separator) return null;

  const [name, setName] = useState(separator.name || '');
  const [selectedBinderId, setSelectedBinderId] = useState(separator.binderId || binders[0]?.id || '');
  const [client, setClient] = useState(separator.client || '');
  const [date, setDate] = useState(separator.date || '');
  const [color, setColor] = useState(separator.color || '#38bdf8');
  const [description, setDescription] = useState(separator.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (separator) {
      setName(separator.name || '');
      setSelectedBinderId(separator.binderId || binders[0]?.id || '');
      setClient(separator.client || '');
      setDate(separator.date || '');
      setColor(separator.color || '#38bdf8');
      setDescription(separator.description || '');
      setError('');
    }
  }, [separator]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم الفاصل ومحتواه');
      return;
    }

    onUpdateSeparator(separator.id, {
      name: name.trim(),
      binderId: selectedBinderId,
      client: client.trim() || 'عام',
      date: date.trim(),
      color: color,
      description: description.trim()
    });

    onClose();
  };

  const colorPresets = [
    { label: 'سماوي', value: '#38bdf8' },
    { label: 'زمردي', value: '#34d399' },
    { label: 'كهرماني', value: '#fbbf24' },
    { label: 'وردي أحمر', value: '#f87171' },
    { label: 'بنفسجي', value: '#a855f7' },
    { label: 'بترولي', value: '#0d9488' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-300">تعديل الفاصل الكرتوني</div>
              <h3 className="text-base font-black text-white">
                تعديل: {separator.name} ({separator.code})
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Separator Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان الفاصل / موضوع الفاصل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="مثال: عقود التوريد 2024، تقارير الفحص الفني..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden font-bold text-slate-900 shadow-2xs"
              required
            />
          </div>

          {/* Target Binder Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              المجلد المودع به (يمكن نقله لمجلد آخر)
            </label>
            <select
              value={selectedBinderId}
              onChange={(e) => setSelectedBinderId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden shadow-2xs"
            >
              {binders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code} • {b.cabinet} - {b.shelf})
                </option>
              ))}
            </select>
          </div>

          {/* Client & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الجهة / العميل المستفيد
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="عام"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الإيداع في المجلد
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY/MM/DD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden shadow-2xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الوصف والملاحظات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="ملاحظات حول الوثائق داخل هذا الفاصل..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden shadow-2xs"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              لون لسان التبويب (Tab Color)
            </label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    color === c.value
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.value }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {onDeleteSeparator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteSeparator(separator);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف هذا الفاصل...</span>
              </button>
            )}
            <div className="flex items-center gap-2.5 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ تعديلات الفاصل</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
