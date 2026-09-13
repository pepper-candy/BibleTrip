export type TourEvent = {
  code: string;
  title: string;
  org: string;
  season: string;
  hostToken: string;
  createdAt: string;
};

export type Participant = {
  id: string;
  name: string;
  joinedAt: string;
};

export type Completion = {
  participantId: string;
  name: string;
  finishedAt: string;
};

export type PublicEvent = {
  code: string;
  title: string;
  org: string;
  program: string;
  season: string;
  translation: string;
};

export type Verse = {
  chapter: number;
  verse: number;
  text: string;
};

export type Passage = {
  ref: string;
  title: string;
  bookName: string;
  chapter: number;
  verses: Verse[];
};

export type DayReading = {
  date: string;
  main: Passage;
  proverbs: Passage;
};

export type ScheduleDay = {
  date: string;
  main: string;
  proverbs: string;
};

export type SeasonSchedule = {
  org: string;
  program: string;
  season: string;
  timezone: string;
  translation: string;
  days: ScheduleDay[];
};
