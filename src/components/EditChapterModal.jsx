import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Save, 
  Building2, 
  Check,
  AlertCircle
} from 'lucide-react';

export default function EditChapterModal({
  isOpen,
  onClose,
  chapter,
  onUpdateChapter
}) {
  if (!isOpen || !chapter) return null;

  const [name, setName] = useState(chapter.name || '');
  const [code, setCode] = useState(chapter.code || '');
  const [description, setDescription] = useState(chapter.description || '');
  const [color, setColor] = useState(chapter.color || '#1e3a8a');
  const [error, setError] = useState('');

  useEffect(() => {
    if (chapter) {
      setName(chapter.name || '');
      setCode(chapter.code || '');
      setDescription(chapter.description || '');
      setColor(chapter.color || '#1e3a8a');
      setError('');
    }
  }, [chapter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم الموضوع');
      return;
    }
    if (!code.trim()) {
      setError('يرجى إدخال كود الموضوع (مثال: AMN)');
      return;
    }

    onUpdateChapter(chapter.id, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      color: color
    });

    onClose();
  };

  const colorPresets = [
    { label: 'أزرق داكن', value: '#1e3a8a' },
    { label: 'زمردي', value: '#065f46' },
    { label: 'كحلي ملكي', value: '#1e1b4b' },
    { label: 'عنابي', value: '#831843' },
    { label: 'كهرماني', value: '#78350f' },
    { label: 'رمادي فحمي', value: '#1e293b' }
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
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-300">تعديل الباب التصنيفي</div>
              <h3 className="text-base font-black text-white">
                تعديل موضوع: {chapter.name}
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

          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم الموضوع (الباب التصنيفي) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="مثال: الأمن المركزي، الخدمات الطبية، الأسلحة والذخيرة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-bold text-slate-900"
              required
            />
          </div>

          {/* Chapter Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رمز الكود المرجعي (3 إلى 4 أحرف إنجليزية) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="مثال: AMN, MED, EDR, CAP, WPN..."
              maxLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-black text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              يُستخدم في أكواد المجلدات والفواصل الورقية (مثال: {code || 'CODE'}-B01-S01).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              وصف الموضوع والغرض منه
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="تفاصيل وثائق وملفات هذا الباب..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden text-slate-800"
            />
          </div>

          {/* Color Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اللون المرجعي للموضوع
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
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
