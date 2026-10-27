import React, { useState, useEffect } from 'react';
import { X, Layers, Sparkles, Hash, Palette } from 'lucide-react';
import { generateNextSeparationCode } from '../services/firebase';

export default function AddSeparationModal({ 
  isOpen, 
  onClose, 
  binder, 
  onAddSeparation 
}) {
  if (!isOpen || !binder) return null;

  const [name, setName] = useState('');
  const [autoCode, setAutoCode] = useState('');
  const [color, setColor] = useState('#38bdf8');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (binder) {
      const generated = generateNextSeparationCode(binder);
      setAutoCode(generated.code);
      setName(`فاصل ${generated.number} (جديد)`);
    }
  }, [binder]);

  const colorPresets = [
    { label: 'سماوي', value: '#38bdf8' },
    { label: 'زمردي', value: '#34d399' },
    { label: 'أصفر كهرماني', value: '#fbbf24' },
    { label: 'وردي أحمر', value: '#f87171' },
    { label: 'بنفسجي', value: '#a855f7' },
    { label: 'وردي فاقع', value: '#ec4899' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("يرجى إدخال اسم الفاصل.");
      return;
    }

    onAddSeparation(binder.id, {
      name: name.trim(),
      code: autoCode,
      color: color,
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-700">تقسيم المجلد الفيزيائي</div>
              <h3 className="text-base font-black text-slate-900">إضافة فاصل داخلي (Divider)</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Target Binder Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-600">المجلد المستهدف:</div>
              <div className="text-xs font-black text-slate-900">{binder.name}</div>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-brand-700">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>كود الفاصل: {autoCode}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الفاصل / التبويب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فواتير الربع الرابع، عقود المقاولين..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-bold text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              لون تبويب الفاصل (لتمييزه بالعين المجردة)
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c.value ? 'scale-110 border-slate-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات عن محتوى الفاصل
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="الوثائق المسموح إيداعها في هذا الفاصل..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              إضافة الفاصل للمجلد
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
