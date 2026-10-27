import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderPlus, 
  MapPin, 
  Layers, 
  Sparkles, 
  Barcode, 
  CheckCircle2, 
  FolderKanban,
  FilePlus2
} from 'lucide-react';
import { generateNextBinderCode } from '../services/firebase';

export default function AddBinderModal({ 
  isOpen, 
  onClose, 
  chapters = [], 
  defaultChapterId = null, 
  onAddBinder 
}) {
  if (!isOpen) return null;

  const [selectedChapterId, setSelectedChapterId] = useState(
    defaultChapterId || chapters[0]?.id || 'ch-amn'
  );
  const [name, setName] = useState('');
  const [autoCode, setAutoCode] = useState('');
  const [cabinet, setCabinet] = useState('الخزانة الرئيسية');
  const [shelf, setShelf] = useState('رف 1');
  const [totalCapacity, setTotalCapacity] = useState(10);
  const [description, setDescription] = useState('');
  const [separationsCount, setSeparationsCount] = useState(4); // Default 4 quarters or tabs

  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  // Update auto generated code when chapter changes
  useEffect(() => {
    if (currentChapter) {
      const generated = generateNextBinderCode(currentChapter.code);
      setAutoCode(generated.code);
    }
  }, [selectedChapterId, currentChapter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("يرجى إدخال اسم المجلد.");
      return;
    }

    // Auto generate initial separations
    const initialSeps = [];
    for (let i = 1; i <= separationsCount; i++) {
      const padNum = i.toString().padStart(2, '0');
      initialSeps.push({
        id: `sep-${Date.now()}-${i}`,
        number: i,
        code: `${autoCode}-S${padNum}`,
        name: `فاصل ${i} (قسم ${String.fromCharCode(64 + i)})`,
        color: ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a855f7', '#ec4899'][(i - 1) % 6],
        docsCount: 0
      });
    }

    onAddBinder({
      chapterId: currentChapter.id,
      chapterName: currentChapter.name,
      chapterCode: currentChapter.code,
      name: name.trim(),
      code: autoCode,
      cabinet: cabinet,
      shelf: shelf,
      totalCapacity: parseInt(totalCapacity) || 10,
      description: description.trim() || `مجلد فيزيائي تابع لباب ${currentChapter.name}`,
      color: currentChapter.color || '#0284c7',
      separations: initialSeps
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
              <FolderPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-700">شركة المستقبل • الأرشيف الميداني</div>
              <h3 className="text-lg font-black text-slate-900">إضافة مجلد جديد تحت الموضوع</h3>
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
          
          {/* Chapter Selector & Auto Generated Code */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الموضوع / الباب التابع له (Chapter) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden transition-all"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} (رمز الباب: {ch.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Generated Code Pill */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">الكود المرجعي التلقائي:</span>
                <p className="text-[10px] text-slate-600 mt-0.5">رمز سهل ومباشر لكعب المجلد والباركود</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-mono text-sm font-black text-brand-700">{autoCode}</span>
              </div>
            </div>
          </div>

          {/* Binder Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المجلد الفيزيائي (Binder Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فواتير الموردين - 2024، عقود المقاولات العامة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-bold text-slate-900 transition-all"
            />
          </div>

          {/* Physical Location: Cabinet & Shelf */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                الخزانة الفيزيائية
              </label>
              <select
                value={cabinet}
                onChange={(e) => setCabinet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold transition-all"
              >
                <option value="الخزانة الرئيسية">الخزانة الرئيسية (غرفة الأرشيف 102)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرف داخل الخزانة
              </label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold transition-all"
              >
                <option value="رف 1">رف 1</option>
                <option value="رف 2">رف 2</option>
                <option value="رف 3">رف 3</option>
                <option value="رف 4">رف 4</option>
                <option value="رف 5">رف 5</option>
              </select>
            </div>
          </div>

          {/* Capacity & Initial Separations */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                السعة القصوى (عدد الفواصل)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عدد الفواصل الداخلية الأولية
              </label>
              <select
                value={separationsCount}
                onChange={(e) => setSeparationsCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
              >
                <option value={2}>2 فواصل (نصف سنوي)</option>
                <option value={4}>4 فواصل (أرباع سنوية Q1-Q4)</option>
                <option value={6}>6 فواصل (شهري أو أقسام)</option>
                <option value={10}>10 فواصل كرتونية</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات ومحتوى المجلد
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتويات المجلد ومجال الحفظ..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
            />
          </div>

          {/* Actions */}
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
              <FolderPlus className="w-4 h-4" />
              <span>إنشاء المجلد وتجهيز الفواصل</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
