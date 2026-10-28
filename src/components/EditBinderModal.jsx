import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderArchive, 
  Save, 
  MapPin, 
  Layers, 
  AlertCircle,
  Trash2 
} from 'lucide-react';

export default function EditBinderModal({
  isOpen,
  onClose,
  binder,
  chapters = [],
  onUpdateBinder,
  onDeleteBinder
}) {
  if (!isOpen || !binder) return null;

  const [name, setName] = useState(binder.name || '');
  const [selectedChapterId, setSelectedChapterId] = useState(binder.chapterId || chapters[0]?.id || '');
  const [cabinet, setCabinet] = useState(binder.cabinet || 'الخزانة الرئيسية');
  const [shelf, setShelf] = useState(binder.shelf || 'رف 1');
  const [color, setColor] = useState(binder.color || '#2563eb');
  const [totalCapacity, setTotalCapacity] = useState(binder.totalCapacity || 10);
  const [description, setDescription] = useState(binder.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (binder) {
      setName(binder.name || '');
      setSelectedChapterId(binder.chapterId || chapters[0]?.id || '');
      setCabinet(binder.cabinet || 'الخزانة الرئيسية');
      setShelf(binder.shelf || 'رف 1');
      setColor(binder.color || '#2563eb');
      setTotalCapacity(binder.totalCapacity || 10);
      setDescription(binder.description || '');
      setError('');
    }
  }, [binder]);

  const selectedChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم المجلد');
      return;
    }

    onUpdateBinder(binder.id, {
      name: name.trim(),
      chapterId: selectedChapter?.id || binder.chapterId,
      chapterName: selectedChapter?.name || binder.chapterName,
      chapterCode: selectedChapter?.code || binder.chapterCode,
      cabinet: cabinet.trim(),
      shelf: shelf.trim(),
      color: color,
      totalCapacity: parseInt(totalCapacity) || 10,
      description: description.trim()
    });

    onClose();
  };

  const colorPresets = [
    { label: 'أزرق كلاسيكي', value: '#2563eb' },
    { label: 'أخضر زمردي', value: '#10b981' },
    { label: 'كهرماني', value: '#f59e0b' },
    { label: 'أحمر داكن', value: '#ef4444' },
    { label: 'بنفسجي', value: '#8b5cf6' },
    { label: 'رمادي غامق', value: '#475569' }
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
              <FolderArchive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-300">تعديل المجلد الفيزيائي</div>
              <h3 className="text-base font-black text-white">
                تعديل: {binder.name} ({binder.code})
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

          {/* Binder Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المجلد الفيزيائي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="مثال: مجلد ملفات الأمن 1..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-bold text-slate-900"
              required
            />
          </div>

          {/* Chapter Selection (Transfer binder) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الموضوع التابع له (الباب)
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.code})
                </option>
              ))}
            </select>
          </div>

          {/* Location: Cabinet & Shelf */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الخزانة
              </label>
              <input
                type="text"
                value={cabinet}
                onChange={(e) => setCabinet(e.target.value)}
                placeholder="الخزانة الرئيسية"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرف الفيزيائي
              </label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold bg-white"
              >
                <option value="رف 1">رف 1</option>
                <option value="رف 2">رف 2</option>
                <option value="رف 3">رف 3</option>
                <option value="رف 4">رف 4</option>
                <option value="رف 5">رف 5</option>
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              السعة القصوى للفواصل الكرتونية بالمجلد
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الوصف أو الملاحظات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="وصف محتويات هذا المجلد..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              لون كعب المجلد
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
            {onDeleteBinder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteBinder(binder);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف هذا المجلد...</span>
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
                <span>حفظ تعديلات المجلد</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
