/**
 * Enterprise Arabic & Multi-field Archive Search Engine
 * Handles Arabic normalization (alef variants, taa marbuta, diacritics),
 * fuzzy partial token matching, and multi-entity cross-referencing.
 */

export const normalizeArabic = (text) => {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel / vowels
    .replace(/[أإآ]/g, 'ا') // Normalize alef variants to bare alif
    .replace(/ة/g, 'ه') // Normalize taa marbuta to haa
    .replace(/[ى]/g, 'ي') // Normalize alif maqsura to yaa
    .replace(/[ـ]/g, '') // Remove kashida / tatweel
    .replace(/[-_/]/g, ' ') // Treat dashes and slashes as token separators
    .trim();
};

export const matchesSearch = (target, query) => {
  if (!query) return true;
  if (!target) return false;

  const normTarget = normalizeArabic(target);
  const normQuery = normalizeArabic(query);

  if (normTarget.includes(normQuery)) return true;

  // Multi-token partial matching: all words in query must match target
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every(token => normTarget.includes(token));
  }

  return false;
};

/**
 * Universal Global Archive Search
 * Searches Chapters (الموضوعات), Binders (المجلدات), and Separators (الفواصل)
 * and enriches each result with its full hierarchical and location context.
 */
export const searchArchiveGlobal = (chapters = [], binders = [], separators = [], rawQuery = '') => {
  const query = (rawQuery || '').trim();
  if (!query) {
    return {
      query: '',
      hasResults: false,
      totalCount: 0,
      chapters: [],
      binders: [],
      separators: []
    };
  }

  // Create lookup maps for fast enrichment
  const chapterMap = new Map();
  chapters.forEach(c => chapterMap.set(c.id, c));
  chapters.forEach(c => chapterMap.set(c.code, c));

  const binderMap = new Map();
  binders.forEach(b => binderMap.set(b.id, b));
  binders.forEach(b => binderMap.set(b.code, b));

  // 1. Search Chapters (الموضوعات والأبواب)
  const matchedChapters = chapters.filter(c => {
    return (
      matchesSearch(c.name, query) ||
      matchesSearch(c.code, query) ||
      matchesSearch(c.description, query) ||
      matchesSearch(c.category, query)
    );
  }).map(c => {
    const chapterBinders = binders.filter(b => b.chapterId === c.id || b.chapterCode === c.code);
    const chapterSeps = separators.filter(s => {
      const b = binderMap.get(s.binderId) || binderMap.get(s.binderCode);
      return b && (b.chapterId === c.id || b.chapterCode === c.code);
    });
    return {
      ...c,
      entityType: 'chapter',
      bindersCount: chapterBinders.length,
      separatorsCount: chapterSeps.length,
      availableCount: chapterSeps.filter(s => s.status === 'available').length,
      checkedOutCount: chapterSeps.filter(s => s.status === 'checked_out').length
    };
  });

  // 2. Search Binders (المجلدات الفيزيائية)
  const matchedBinders = binders.filter(b => {
    const parentChapter = chapterMap.get(b.chapterId) || chapterMap.get(b.chapterCode);
    return (
      matchesSearch(b.name, query) ||
      matchesSearch(b.code, query) ||
      matchesSearch(b.location, query) ||
      matchesSearch(b.description, query) ||
      matchesSearch(b.notes, query) ||
      (parentChapter && matchesSearch(parentChapter.name, query))
    );
  }).map(b => {
    const parentChapter = chapterMap.get(b.chapterId) || chapterMap.get(b.chapterCode);
    const binderSeps = separators.filter(s => s.binderId === b.id || s.binderCode === b.code);
    return {
      ...b,
      entityType: 'binder',
      chapterName: parentChapter?.name || b.chapterName || 'الموضوع العام',
      chapterColor: parentChapter?.color || 'blue',
      separatorsCount: binderSeps.length,
      availableCount: binderSeps.filter(s => s.status === 'available').length,
      checkedOutCount: binderSeps.filter(s => s.status === 'checked_out').length
    };
  });

  // 3. Search Separators (الفواصل الكرتونية المودعة)
  const matchedSeparators = separators.filter(s => {
    const parentBinder = binderMap.get(s.binderId) || binderMap.get(s.binderCode);
    const parentChapter = parentBinder ? (chapterMap.get(parentBinder.chapterId) || chapterMap.get(parentBinder.chapterCode)) : null;

    return (
      matchesSearch(s.name, query) ||
      matchesSearch(s.code, query) ||
      matchesSearch(s.client, query) ||
      matchesSearch(s.description, query) ||
      matchesSearch(s.borrower, query) ||
      matchesSearch(s.location, query) ||
      matchesSearch(s.notes, query) ||
      matchesSearch(s.category, query) ||
      (parentBinder && matchesSearch(parentBinder.name, query)) ||
      (parentBinder && matchesSearch(parentBinder.code, query)) ||
      (parentChapter && matchesSearch(parentChapter.name, query))
    );
  }).map(s => {
    const parentBinder = binderMap.get(s.binderId) || binderMap.get(s.binderCode);
    const parentChapter = parentBinder ? (chapterMap.get(parentBinder.chapterId) || chapterMap.get(parentBinder.chapterCode)) : null;

    return {
      ...s,
      entityType: 'separator',
      binderName: parentBinder?.name || s.binderName || 'مجلد غير محدد',
      binderCode: parentBinder?.code || s.binderCode || '-',
      chapterId: parentChapter?.id || parentBinder?.chapterId || null,
      chapterName: parentChapter?.name || 'موضوع الأرشيف',
      chapterColor: parentChapter?.color || 'blue',
      physicalLocation: s.location || parentBinder?.location || 'الدولاب الرئيسي'
    };
  });

  const totalCount = matchedChapters.length + matchedBinders.length + matchedSeparators.length;

  return {
    query,
    hasResults: totalCount > 0,
    totalCount,
    chapters: matchedChapters,
    binders: matchedBinders,
    separators: matchedSeparators
  };
};
