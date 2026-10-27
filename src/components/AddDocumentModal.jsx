import React, { useState, useEffect } from 'react';
import { 
  X, 
  FilePlus2, 
  MapPin, 
  FolderKanban, 
  Building2, 
  Calendar, 
  Layers, 
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddDocumentModal({ 
  isOpen, 
  onClose, 
  onAddDocument, 
  chapters = [], 
  binders = [],
  initialContext = null 
}) {
  if (!isOpen) return null;

  const [selectedChapterId, setSelectedChapterId] = useState(
    initialContext?.chapterId || chapters[0]?.id || 'ch-fin'
  );

  // Filter binders belonging to selected chapter
  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  const availableBinders = binders.filter(
    b => b.chapterId === currentChapter?.id || b.chapterCode === currentChapter?.code
  );

  const [selectedBinderId, setSelectedBinderId] = useState(
    initialContext?.binderId || availableBinders[0]?.id || binders[0]?.id || 'binder-1'
  );

  const selectedBinder = binders.find(b => b.id === selectedBinderId) || availableBinders[0] || binders[0];
  const availableSeparations = selectedBinder?.separations || [];

  const [selectedSeparationId, setSelectedSeparationId] = useState(
    initialContext?.separationId || availableSeparations[0]?.id || ''
  );

  const selectedSeparation = availableSeparations.find(s => s.id === selectedSeparationId) || availableSeparations[0];

  const [formData, setFormData] = useState({
    title: '',
    docNumber: '',
    client: '',
    date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    status: 'available', // available or checked_out
    borrower: '',
    pagesCount: 8,
    notes: ''
  });

  // Whenever chapter changes, pick first binder
  useEffect(() => {
    if (availableBinders.length > 0) {
      if (!availableBinders.some(b => b.id === selectedBinderId)) {
        setSelectedBinderId(availableBinders[0].id);
      }
    }
  }, [selectedChapterId]);

  // Whenever binder changes, pick first separation & update auto doc number
  useEffect(() => {
    if (selectedBinder) {
      const seps = selectedBinder.separations || [];
      if (seps.length > 0 && !seps.some(s => s.id === selectedSeparationId)) {
        setSelectedSeparationId(seps[0].id);
      }

      // Auto generate document code
      const sepCode = selectedSeparation?.code || `${selectedBinder.code}-S01`;
      const randomDocNum = Math.floor(100 + Math.random() * 900);
      setFormData(prev => ({
        ...prev,
        docNumber: `${sepCode}-D${randomDocNum}`
      }));
    }
  }, [selectedBinderId, selectedSeparationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("يرجى إدخال اسم أو عنوان الوثيقة.");
      return;
    }

    const docToAdd = {
      ...formData,
      chapterId: currentChapter?.id,
      chapterName: currentChapter?.name,
      chapterCode: currentChapter?.code,
      binderId: selectedBinder?.id,
      binderName: selectedBinder?.name,
      binderCode: selectedBinder?.code,
      separationId: selectedSeparation?.id || 'sep-1',
      separationName: selectedSeparation?.name || 'فاصل عام',
      separationCode: selectedSeparation?.code || `${selectedBinder?.code}-S01`,
      cabinet: selectedBinder?.cabinet || 'خزانة أ',
      shelf: selectedBinder?.shelf || 'رف 3',
      location: `${selectedBinder?.cabinet || 'خزانة أ'} - ${selectedBinder?.shelf || 'رف 3'}`,
      folderTab: `${selectedSeparation?.name || 'فاصل 1'} (${selectedSeparation?.code || selectedBinder?.code})`,
      qrCode: `ARC-${formData.docNumber}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      borrower: formData.status === 'checked_out' ? (formData.borrower || 'أحمد (مستعار عند الإيداع)') : null,
      borrowDate: formData.status === 'checked_out' ? formData.date : null,
      dueDate: formData.status === 'checked_out' ? '2024/02/15' : null,
    };

    onAddDocument(docToAdd);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-brand-50 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <FilePlus2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-700">شركة المستقبل • تصنيف هرمي دقيق</div>
              <h3 className="text-lg font-black text-slate-900">إيداع وثيقة ورقية في الأرشيف</h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          
          {/* STEP 1 & 2: Chapter -> Binder -> Separation Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-600" />
                تحديد الهيكل الأرشيفي: الموضوع ➔ المجلد ➔ الفاصل
              </span>
              <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {selectedBinder?.cabinet} • {selectedBinder?.shelf}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Chapter (الموضوع) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. الموضوع / الباب (Chapter) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} ({ch.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Binder (المجلد) with Auto Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. المجلد الفيزيائي (Binder) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBinderId}
                  onChange={(e) => setSelectedBinderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  {availableBinders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Separation (الفاصل الداخلي) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. الفاصل الداخلي (Separation) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSeparationId}
                  onChange={(e) => setSelectedSeparationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
                >
                  {availableSeparations.map((sep) => (
                    <option key={sep.id} value={sep.id}>
                      {sep.code} - {sep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hierarchical Breadcrumb Feedback */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">المسار الميداني المحدد:</span>
              <div className="flex items-center gap-1.5 font-bold text-brand-900">
                <span>{currentChapter?.name}</span>
                <span className="text-slate-400">←</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded">{selectedBinder?.code}</span>
                <span className="text-slate-400">←</span>
                <span className="text-brand-700">{selectedSeparation?.name || 'فاصل 1'}</span>
              </div>
            </div>
          </div>

          {/* Document Title & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم أو عنوان الوثيقة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: عقد توريد خوادم سحابية، فاتورة رقم 105، محضر اجتماع..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-bold text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود الوثيقة الهرمي التلقائي
              </label>
              <input
                type="text"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-hidden text-sm font-mono font-black text-brand-700 text-left transition-all"
              />
            </div>
          </div>

          {/* Client, Date, Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الجهة / العميل المرتبط
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="مثال: شركة الأفق، بنك الرياض..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الوثيقة
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="YYYY/MM/DD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-left font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عدد الصفحات الورقية
              </label>
              <input
                type="number"
                min="1"
                value={formData.pagesCount}
                onChange={(e) => setFormData({ ...formData, pagesCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-left"
              />
            </div>
          </div>

          {/* Physical Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              الحالة الفيزيائية الأولية للوثيقة
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.status === 'available'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={formData.status === 'available'}
                  onChange={() => setFormData({ ...formData, status: 'available', borrower: '' })}
                  className="sr-only"
                />
                <span className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                  {formData.status === 'available' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </span>
                <div>
                  <div className="text-sm font-bold">🟢 متاح (Available)</div>
                  <div className="text-[11px] text-slate-600">الوثيقة مودعة داخل الفاصل بالخزانة</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.status === 'checked_out'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="checked_out"
                  checked={formData.status === 'checked_out'}
                  onChange={() => setFormData({ ...formData, status: 'checked_out' })}
                  className="sr-only"
                />
                <span className="w-4 h-4 rounded-full border-2 border-amber-600 flex items-center justify-center">
                  {formData.status === 'checked_out' && <span className="w-2 h-2 rounded-full bg-amber-600"></span>}
                </span>
                <div>
                  <div className="text-sm font-bold">🟡 مستعار (Checked Out)</div>
                  <div className="text-[11px] text-slate-600">الوثيقة قيد الاستخدام الميداني</div>
                </div>
              </label>
            </div>

            {formData.status === 'checked_out' && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  اسم المستعير / القسم
                </label>
                <input
                  type="text"
                  value={formData.borrower}
                  onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
                  placeholder="مثال: أحمد الراجحي (قسم المالية)"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-amber-900"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات أرشفة إضافية
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="مثال: تتضمن ختم أصل معتمد وموقعة من المفوض الإداري..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>إيداع الوثيقة وتوليد الباركود</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
