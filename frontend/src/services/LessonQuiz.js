const shuffle = (items) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
};

const getUniqueValues = (vocabularies, property) => {
  const values = new Map();

  vocabularies.forEach((vocabulary) => {
    const value = vocabulary[property]?.trim();
    if (value && !values.has(value.toLowerCase())) {
      values.set(value.toLowerCase(), value);
    }
  });

  return [...values.values()];
};

export const canCreateLessonQuiz = (vocabularies) =>
  getUniqueValues(vocabularies, "wordSimplified").length >= 4 &&
  getUniqueValues(vocabularies, "meaning").length >= 4 &&
  vocabularies.every((vocabulary) => vocabulary.pinyin?.trim());

const createChoices = (vocabularies, property, answer) => {
  const otherValues = getUniqueValues(vocabularies, property).filter(
    (value) => value.toLowerCase() !== answer.toLowerCase(),
  );

  return shuffle([answer, ...shuffle(otherValues).slice(0, 3)]);
};

export const createLessonQuiz = (vocabularies) => {
  if (!canCreateLessonQuiz(vocabularies)) {
    return [];
  }

  return shuffle(vocabularies).map((vocabulary) => ({
    vocabulary,
    meaningOptions: createChoices(
      vocabularies,
      "meaning",
      vocabulary.meaning,
    ),
    wordOptions: createChoices(
      vocabularies,
      "wordSimplified",
      vocabulary.wordSimplified,
    ),
  }));
};

export const normalizePinyin = (value) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
