const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "Actions speak louder than words.",
  "The early bird catches the worm.",
  "Practice makes perfect.",
  "Knowledge is power.",
  "Time is money.",
  "Better late than never.",
  "Where there is a will, there is a way.",
  "The pen is mightier than the sword.",
  "Beauty is in the eye of the beholder.",
  "Two wrongs don't make a right.",
  "When in Rome, do as the Romans do.",
  "The squeaky wheel gets the grease.",
  "Fortune favors the bold.",
  "People who live in glass houses should not throw stones.",
  "Hope for the best, but prepare for the worst.",
  "Keep your friends close and your enemies closer.",
  "A picture is worth a thousand words.",
  "There's no such thing as a free lunch.",
  "Easy come, easy go.",
  "You can't judge a book by its cover.",
  "Good things come to those who wait.",
  "Don't bite the hand that feeds you.",
  "No man is an island.",
  "The grass is always greener on the other side.",
  "Don't count your chickens before they hatch.",
  "If you can't beat them, join them."
];

export const getRandomSentence = (): string => {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
};