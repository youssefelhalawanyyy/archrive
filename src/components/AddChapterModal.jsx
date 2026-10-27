import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Hash, Palette } from 'lucide-react';

export default function AddChapterModal({ isOpen, onClose, onAddChapter }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0284c7');

  const colorPresets = [
    { label: 'أزرق ملكي', value: '#0284c7' },
    { label: 'أخضر زمردي', value: '#059669' },
    { label: 'بنفسجي داكن', value: '#7c3aed' },
    { label: 'برتقالي كهرماني', value: '#ea580c' },
    { label: 'تركواز بترولي', value: '#0d9488' },
    { label: 'أحمر قرمزي', value: '#e11d48' },
  ];

  // Auto suggest code from Arabic name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!code) {
      if (val.includes('مالي') || val.includes('حساب')) setCode('FIN');
      else if (val.includes('عقد') || val.includes('اتفاق')) setCode('CNT');
      else if (val.includes('موارد') || val.includes('موظف')) setCode('HR');
      else if (val.includes('قانون') || val.includes('سجل')) setCode('LEG');
      else if (val.includes('مشتر') || val.includes('توريد')) setCode('PRC');
      else if (val.includes('مشاريع') || val.includes('مشروع')) setCode('PRJ');
      else if (val.includes('تقني') || val.includes('حاسب')) setCode('IT');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("يرجى كتابة اسم الموضوع / الباب.");
      return;
    }

    const finalCode = (code.trim() || 'SEC').toUpperCase().slice(0, 4);

    onAddChapter({
      name: name.trim(),
      code: finalCode,
      description: description.trim() || 'تصنيف موضوعي رئيسي للأرشيف الورقي',
      color: color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-700">شركة المستقبل • تصنيف الأرشيف</div>
              <h3 className="text-lg font-black text-slate-900">إضافة موضوع / باب رئيسي (Chapter)</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم الموضوع / الباب الرئيسي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="مثال: الشؤون المالية، العقود، الموارد البشرية..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-bold text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>كود الموضوع المختصر (رمز الباب) <span className="text-red-500">*</span></span>
              <span className="text-[11px] font-normal text-slate-600">سيستخدم في التوليد التلقائي لأكواد المجلدات</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FIN / CNT / HR / IT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-mono font-black text-brand-700 uppercase tracking-widest text-left transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-600">
                <Hash className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              أمثلة: <strong className="text-brand-700 font-mono">FIN</strong> للمالية، <strong className="text-brand-700 font-mono">HR</strong> للموظفين، <strong className="text-brand-700 font-mono">CNT</strong> للعقود
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اللون المميز للموضوع
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c.value ? 'scale-110 border-slate-900 ring-2 ring-brand-500/30' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الوصف والمجال الأرشيفي
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لنوعية الوثائق والملفات المندرجة تحت هذا الباب..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-medium transition-all"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>إنشاء الموضوع وتجهيز المجلدات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
