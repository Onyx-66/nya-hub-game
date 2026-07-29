// =============================================
// QuizEngine — Pure TypeScript quiz logic with bilingual question bank.
// =============================================

export type QuizCategory = 'general' | 'science' | 'history' | 'gaming' | 'cats';
export type QuizState = 'menu' | 'playing' | 'boss' | 'victory' | 'defeat';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanationEn: string;
  explanationAr: string;
}

function mk(
  id: string, cat: QuizCategory,
  qEn: string, qAr: string,
  oEn: string[], oAr: string[],
  ci: number, diff: 'easy' | 'medium' | 'hard',
  eEn: string, eAr: string,
): QuizQuestion {
  return { id, category: cat, questionEn: qEn, questionAr: qAr, optionsEn: oEn, optionsAr: oAr, correctIndex: ci, difficulty: diff, explanationEn: eEn, explanationAr: eAr };
}

export const QUESTION_BANK: QuizQuestion[] = [
  // ── General (10) ──
  mk('g1', 'general', 'What is the capital of France?', 'ما هي عاصمة فرنسا؟', ['Paris', 'London', 'Berlin', 'Madrid'], ['باريس', 'لندن', 'برلين', 'مدريد'], 0, 'easy', 'Paris has been the capital of France since medieval times.', 'باريس عاصمة فرنسا منذ العصور الوسطى.'),
  mk('g2', 'general', 'Which is the largest ocean?', 'ما هو أكبر محيط؟', ['Pacific', 'Atlantic', 'Indian', 'Arctic'], ['الهادئ', 'الأطلسي', 'الهندي', 'المتجمد الشمالي'], 0, 'easy', 'The Pacific Ocean covers about 63 million square miles.', 'يغطي المحيط الهادئ حوالي 63 مليون ميل مربع.'),
  mk('g3', 'general', 'How many continents are there?', 'كم عدد القارات؟', ['7', '5', '6', '8'], ['7', '5', '6', '8'], 0, 'easy', 'There are 7 continents on Earth.', 'يوجد 7 قارات على الأرض.'),
  mk('g4', 'general', 'What is the capital of Japan?', 'ما هي عاصمة اليابان؟', ['Tokyo', 'Beijing', 'Seoul', 'Bangkok'], ['طوكيو', 'بكين', 'سيول', 'بانكوك'], 0, 'easy', 'Tokyo became the capital of Japan in 1868.', 'أصبحت طوكيو عاصمة اليابان عام 1868.'),
  mk('g5', 'general', 'Which is the largest planet in our solar system?', 'ما هو أكبر كوكب في المجموعة الشمسية؟', ['Jupiter', 'Saturn', 'Earth', 'Mars'], ['المشتري', 'زحل', 'الأرض', 'المريخ'], 0, 'medium', 'Jupiter is so large that all other planets could fit inside it.', 'المشتري كبير لدرجة أن جميع الكواكب الأخرى يمكن أن تتسع بداخله.'),
  mk('g6', 'general', 'What is the capital of Egypt?', 'ما هي عاصمة مصر؟', ['Cairo', 'Lagos', 'Tunis', 'Rabat'], ['القاهرة', 'لاغوس', 'تونس', 'الرباط'], 0, 'easy', 'Cairo is the capital and largest city of Egypt.', 'القاهرة عاصمة وأكبر مدينة في مصر.'),
  mk('g7', 'general', 'How many planets are in our solar system?', 'كم عدد الكواكب في المجموعة الشمسية؟', ['8', '9', '7', '10'], ['8', '9', '7', '10'], 0, 'medium', 'Pluto was reclassified as a dwarf planet in 2006.', 'أعيد تصنيف بلوتو ككوكب قزم عام 2006.'),
  mk('g8', 'general', 'What is the capital of the United States?', 'ما هي عاصمة الولايات المتحدة؟', ['Washington D.C.', 'New York', 'Los Angeles', 'Chicago'], ['واشنطن العاصمة', 'نيويورك', 'لوس أنجلوس', 'شيكاغو'], 0, 'easy', 'Washington D.C. became the capital in 1790.', 'أصبحت واشنطن العاصمة عام 1790.'),
  mk('g9', 'general', 'Which is the largest country by area?', 'ما هو أكبر دولة من حيث المساحة؟', ['Russia', 'China', 'USA', 'Canada'], ['روسيا', 'الصين', 'أمريكا', 'كندا'], 0, 'medium', 'Russia spans over 17 million square kilometers.', 'تمتد روسيا على أكثر من 17 مليون كيلومتر مربع.'),
  mk('g10', 'general', 'What is the capital of Australia?', 'ما هي عاصمة أستراليا؟', ['Canberra', 'Sydney', 'Melbourne', 'Perth'], ['كانبيرا', 'سيدني', 'ملبورن', 'بيرث'], 0, 'hard', 'Canberra was specifically built to be the capital.', 'تم بناء كانبيرا خصيصاً لتكون العاصمة.'),

  // ── Science (8) ──
  mk('s1', 'science', 'What is the chemical symbol for water?', 'ما هو الرمز الكيميائي للماء؟', ['H₂O', 'CO₂', 'O₂', 'NaCl'], ['H₂O', 'CO₂', 'O₂', 'NaCl'], 0, 'easy', 'Water consists of two hydrogen atoms and one oxygen atom.', 'يتكون الماء من ذرتين هيدروجين وذرة أكسجين واحدة.'),
  mk('s2', 'science', 'How many bones are in the adult human body?', 'كم عدد العظام في جسم الإنسان البالغ؟', ['206', '201', '210', '196'], ['206', '201', '210', '196'], 0, 'hard', 'Adults have 206 bones; babies are born with about 300.', 'البالغون لديهم 206 عظمة؛ يولد الأطفال بحوالي 300.'),
  mk('s3', 'science', 'What is the approximate speed of light?', 'ما هي سرعة الضوء التقريبية؟', ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], ['300,000 كم/ث', '150,000 كم/ث', '500,000 كم/ث', '100,000 كم/ث'], 0, 'medium', 'Light travels at about 299,792 kilometers per second.', 'ينتقل الضوء بحوالي 299,792 كيلومتر في الثانية.'),
  mk('s4', 'science', 'Which planet is closest to the Sun?', 'أي كوكب هو الأقرب للشمس؟', ['Mercury', 'Venus', 'Mars', 'Earth'], ['عطارد', 'الزهرة', 'المريخ', 'الأرض'], 0, 'easy', 'Mercury orbits the Sun at an average distance of 58 million km.', 'يدور عطارد حول الشمس بمسافة متوسطة 58 مليون كم.'),
  mk('s5', 'science', 'Which gas do plants absorb from the atmosphere?', 'أي غاز تمتصه النباتات من الغلاف الجوي؟', ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], ['ثاني أكسيد الكربون', 'الأكسجين', 'النيتروجين', 'الهيدروجين'], 0, 'easy', 'Plants use CO₂ during photosynthesis to make food.', 'تستخدم النباتات ثاني أكسيد الكربون في البناء الضوئي.'),
  mk('s6', 'science', 'How many chambers does the human heart have?', 'كم عدد غرف القلب البشري؟', ['4', '3', '2', '5'], ['4', '3', '2', '5'], 0, 'medium', 'The heart has two atria and two ventricles.', 'للقلب أذينان وبطينان.'),
  mk('s7', 'science', 'What is the hardest natural substance on Earth?', 'ما هو أصلب مادة طبيعية على الأرض؟', ['Diamond', 'Gold', 'Iron', 'Quartz'], ['الماس', 'الذهب', 'الحديد', 'الكوارتز'], 0, 'easy', 'Diamond rates 10 on the Mohs hardness scale.', 'يصنف الماس 10 على مقياس موس للصلابة.'),
  mk('s8', 'science', 'What does DNA stand for?', 'ماذا تعني DNA؟', ['Deoxyribonucleic acid', 'Ribonucleic acid', 'Protein', 'Enzyme'], ['حمض ديوكسيريبونوكلييك', 'حمض الريبونوكلييك', 'بروتين', 'إنزيم'], 0, 'hard', 'DNA carries the genetic instructions for all living organisms.', 'يحمل الحمض النووي التعليمات الجينية لجميع الكائنات الحية.'),

  // ── History (8) ──
  mk('h1', 'history', 'Where is the Great Wall located?', 'أين يقع سور الصين العظيم؟', ['China', 'Japan', 'India', 'Korea'], ['الصين', 'اليابان', 'الهند', 'كوريا'], 0, 'easy', 'The Great Wall stretches over 21,000 kilometers.', 'يمتد سور الصين العظيم لأكثر من 21,000 كيلومتر.'),
  mk('h2', 'history', 'Where are the famous pyramids of Giza located?', 'أين تقع أهرامات الجيزة الشهيرة؟', ['Egypt', 'Mexico', 'Greece', 'Iraq'], ['مصر', 'المكسيك', 'اليونان', 'العراق'], 0, 'easy', 'The pyramids were built over 4,500 years ago.', 'بنيت الأهرامات قبل أكثر من 4,500 سنة.'),
  mk('h3', 'history', 'In which year did the first moon landing occur?', 'في أي سنة حدث أول هبوط على القمر؟', ['1969', '1959', '1979', '1965'], ['1969', '1959', '1979', '1965'], 0, 'medium', 'Apollo 11 landed on the Moon on July 20, 1969.', 'هبط أبولو 11 على القمر في 20 يوليو 1969.'),
  mk('h4', 'history', 'What was the capital of the Roman Empire?', 'ما كانت عاصمة الإمبراطورية الرومانية؟', ['Rome', 'Athens', 'Cairo', 'Paris'], ['روما', 'أثينا', 'القاهرة', 'باريس'], 0, 'easy', 'Rome was the center of the Roman Empire for centuries.', 'كانت روما مركز الإمبراطورية الرومانية لقرون.'),
  mk('h5', 'history', 'Who is traditionally credited with writing the Odyssey?', 'من يُنسب إليه تقليدياً كتابة الأوديسة؟', ['Homer', 'Shakespeare', 'Virgil', 'Dante'], ['هوميروس', 'شكسبير', 'فيرجيل', 'دانتي'], 0, 'medium', 'Homer composed the Odyssey in ancient Greece around 8th century BC.', 'ألّف هوميروس الأوديسة في اليونان القديمة حوالي القرن الثامن قبل الميلاد.'),
  mk('h6', 'history', 'In which year did World War II end?', 'في أي سنة انتهت الحرب العالمية الثانية؟', ['1945', '1944', '1946', '1943'], ['1945', '1944', '1946', '1943'], 0, 'easy', 'WWII ended in September 1945 with Japan\'s surrender.', 'انتهت الحرب العالمية الثانية في سبتمبر 1945 باستسلام اليابان.'),
  mk('h7', 'history', 'Who was the first President of the United States?', 'من كان أول رئيس للولايات المتحدة؟', ['George Washington', 'Abraham Lincoln', 'Thomas Jefferson', 'John Adams'], ['جورج واشنطن', 'أبراهام لينكولن', 'توماس جفرسون', 'جون آدمز'], 0, 'easy', 'Washington served as president from 1789 to 1797.', 'شغل واشنطن منصب الرئاسة من 1789 إلى 1797.'),
  mk('h8', 'history', 'Who was the Greek god of war?', 'من كان إله الحرب اليوناني؟', ['Ares', 'Zeus', 'Apollo', 'Hermes'], ['آريس', 'زيوس', 'أبولو', 'هرمس'], 0, 'medium', 'Ares represented the brutal and violent aspects of war.', 'مثل آريس الجوانب الوحشية والعنيفة للحرب.'),

  // ── Gaming (7) ──
  mk('gm1', 'gaming', 'What is Mario\'s profession?', 'ما هي مهنة ماريو؟', ['Plumber', 'Carpenter', 'Electrician', 'Chef'], ['سباك', 'نجار', 'كهربائي', 'طباخ'], 0, 'easy', 'Mario and Luigi are plumbers in the Mushroom Kingdom.', 'ماريو ولويجي سباكان في مملكة الفطر.'),
  mk('gm2', 'gaming', 'What species is Sonic the Hedgehog?', 'ما هو نوع سونيك؟', ['Hedgehog', 'Fox', 'Rabbit', 'Squirrel'], ['قنفذ', 'ثعلب', 'أرنب', 'سنجاب'], 0, 'easy', 'Sonic is a blue hedgehog known for super speed.', 'سونيك قنفذ أزرق معروف بسرعته الخارقة.'),
  mk('gm3', 'gaming', 'Which is the best-selling video game of all time?', 'ما هي أكثر لعبة فيديو مبيعاً على الإطلاق؟', ['Minecraft', 'Tetris', 'GTA V', 'Wii Sports'], ['ماينكرافت', 'تتريس', 'GTA V', 'Wii Sports'], 0, 'medium', 'Minecraft has sold over 300 million copies.', 'باعت ماينكرافت أكثر من 300 مليون نسخة.'),
  mk('gm4', 'gaming', 'What was Pac-Man\'s original name?', 'ما كان الاسم الأصلي لـ Pac-Man؟', ['Puck Man', 'Ghost Man', 'Dot Man', 'Chomp Man'], ['باك مان', 'رجل الأشباح', 'رجل النقاط', 'رجل القضم'], 0, 'hard', 'It was changed to Pac-Man to prevent vandalism of arcade cabinets.', 'تم تغيير الاسم لمنع التخريب في أجهزة الألعاب.'),
  mk('gm5', 'gaming', 'Which were the first Pokémon games?', 'ما هي أول ألعاب بوكيمون؟', ['Red and Blue', 'Gold and Silver', 'Diamond and Pearl', 'Sun and Moon'], ['الأحمر والأزرق', 'الذهب والفضة', 'الماس واللؤلؤ', 'الشمس والقمر'], 0, 'medium', 'Pokémon Red and Blue were released in 1996.', 'صدر بوكيمون الأحمر والأزرق عام 1996.'),
  mk('gm6', 'gaming', 'What weapon does Link primarily use?', 'ما هي الأسلحة التي يستخدمها لينك بشكل أساسي؟', ['Sword', 'Bow', 'Axe', 'Spear'], ['سيف', 'قوس', 'فأس', 'رمح'], 0, 'easy', 'Link\'s Master Sword is iconic in the Zelda series.', 'سيف لينك الرئيسي أيقوني في سلسلة زيلدا.'),
  mk('gm7', 'gaming', 'In which country was Tetris created?', 'في أي دولة تم إنشاء تتريس؟', ['Russia', 'Japan', 'USA', 'China'], ['روسيا', 'اليابان', 'أمريكا', 'الصين'], 0, 'medium', 'Tetris was created by Alexey Pajitnov in the Soviet Union in 1984.', 'تم إنشاء تتريس بواسطة أليكسي باجيتنوف في الاتحاد السوفييتي عام 1984.'),

  // ── Cats (7) ──
  mk('c1', 'cats', 'Who was the ancient Egyptian cat goddess?', 'من كانت آلهة القطط في مصر القديمة؟', ['Bastet', 'Isis', 'Hathor', 'Sekhmet'], ['باستت', 'إيزيس', 'حتحور', 'سخمت'], 0, 'medium', 'Bastet was the goddess of home, fertility, and cats.', 'كانت باستت إلهة المنزل والخصوبة والقطط.'),
  mk('c2', 'cats', 'Which is the largest domestic cat breed?', 'ما هو أكبر سلالة قطط منزلية؟', ['Maine Coon', 'Persian', 'Siamese', 'Bengal'], ['مين كون', 'فارسي', 'سيامي', 'بنغالي'], 0, 'medium', 'Maine Coons can weigh up to 11 kg or more.', 'يمكن أن يزن قط المين كون حتى 11 كجم أو أكثر.'),
  mk('c3', 'cats', 'What is a cat\'s normal body temperature?', 'ما هي درجة حرارة جسم القط الطبيعية؟', ['38.5°C', '37°C', '39.5°C', '36.5°C'], ['38.5°م', '37°م', '39.5°م', '36.5°م'], 0, 'hard', 'Cats have a higher body temperature than humans.', 'درجة حرارة جسم القط أعلى من الإنسان.'),
  mk('c4', 'cats', 'How many whiskers does a cat typically have?', 'كم عدد شوارب القط عادةً؟', ['24', '16', '12', '30'], ['24', '16', '12', '30'], 0, 'hard', 'Cats have about 12 whiskers on each side of their muzzle.', 'للقطط حوالي 12 شارب على كل جانب من الكمامة.'),
  mk('c5', 'cats', 'What is a group of cats called?', 'ماذا يسمى مجموعة القطط؟', ['Clowder', 'Pack', 'Flock', 'Herd'], ['قطيع', 'زمرة', 'سرب', ' herd'], 0, 'hard', 'A group of cats is called a clowder.', 'تسمى مجموعة القطط قطيعاً.'),
  mk('c6', 'cats', 'What frequency range do cats purr at?', 'في أي مدى تردد تتعرر القطط؟', ['25-150 Hz', '10-50 Hz', '100-300 Hz', '200-400 Hz'], ['25-150 هرتز', '10-50 هرتز', '100-300 هرتز', '200-400 هرتز'], 0, 'hard', 'Purring may promote bone density and healing.', 'قد يعزز الخرخرة كثافة العظام والشفاء.'),
  mk('c7', 'cats', 'The oldest recorded cat lived to what age?', 'كم عاش أقدم قط مسجل؟', ['38 years', '25 years', '30 years', '42 years'], ['38 سنة', '25 سنة', '30 سنة', '42 سنة'], 0, 'hard', 'Creme Puff lived to 38 years and 3 days old.', 'عاش قط يدعى كريم بوف حتى 38 سنة و3 أيام.'),
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class QuizEngine {
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  score = 0;
  correctAnswers = 0;
  swordCharge = 0;
  maxSwordCharge = 100;
  state: QuizState = 'menu';
  language: 'en' | 'ar';
  category: QuizCategory | 'all';
  bossCorrect = 0;

  onStateChange: ((state: QuizState) => void) | null = null;
  onScoreChange: ((score: number) => void) | null = null;
  onChargeChange: ((charge: number) => void) | null = null;

  private bossQuestions: QuizQuestion[] = [];
  private inBossBattle = false;

  constructor(category: QuizCategory | 'all', language: 'en' | 'ar') {
    this.category = category;
    this.language = language;
    this.loadQuestions();
  }

  private loadQuestions(): void {
    let pool = QUESTION_BANK;
    if (this.category !== 'all') {
      pool = pool.filter((q) => q.category === this.category);
    }
    this.questions = shuffle(pool).slice(0, Math.min(10, pool.length));
  }

  startGame(): void {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.swordCharge = 0;
    this.inBossBattle = false;
    this.bossCorrect = 0;
    this.state = 'playing';
    this.onStateChange?.(this.state);
  }

  answerQuestion(index: number): { correct: boolean; explanation: string } {
    const q = this.getCurrentQuestion();
    if (!q) return { correct: false, explanation: '' };
    const correct = index === q.correctIndex;
    if (correct) {
      this.score += 100;
      this.correctAnswers++;
      this.swordCharge = Math.min(this.maxSwordCharge, this.swordCharge + 10);
      if (this.inBossBattle) this.bossCorrect++;
      this.onScoreChange?.(this.score);
      this.onChargeChange?.(this.swordCharge);
    }
    const explanation = this.language === 'ar' ? q.explanationAr : q.explanationEn;
    return { correct, explanation };
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;

    if (this.inBossBattle) {
      if (this.currentQuestionIndex >= this.bossQuestions.length) {
        if (this.bossCorrect >= 2) {
          this.score += 500;
          this.state = 'victory';
        } else {
          this.state = 'defeat';
        }
        this.onStateChange?.(this.state);
      }
      return;
    }

    if (this.currentQuestionIndex >= this.questions.length) {
      if (this.correctAnswers >= 7) {
        this.inBossBattle = true;
        this.bossCorrect = 0;
        this.currentQuestionIndex = 0;
        this.loadBossQuestions();
        this.state = 'boss';
      } else {
        this.state = 'defeat';
      }
      this.onStateChange?.(this.state);
    }
  }

  private loadBossQuestions(): void {
    let pool = QUESTION_BANK.filter((q) => q.difficulty === 'hard');
    if (this.category !== 'all') {
      pool = pool.filter((q) => q.category === this.category);
    }
    if (pool.length < 3) {
      pool = QUESTION_BANK.filter((q) => q.difficulty !== 'easy');
      if (this.category !== 'all') pool = pool.filter((q) => q.category === this.category);
    }
    this.bossQuestions = shuffle(pool).slice(0, 3);
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (this.inBossBattle) {
      return this.bossQuestions[this.currentQuestionIndex] ?? null;
    }
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  getProgress(): { current: number; total: number; correct: number } {
    const total = this.inBossBattle ? this.bossQuestions.length : this.questions.length;
    return { current: this.currentQuestionIndex + 1, total, correct: this.correctAnswers };
  }

  getBossProgress(): { current: number; total: number; correct: number } {
    return { current: this.currentQuestionIndex + 1, total: this.bossQuestions.length, correct: this.bossCorrect };
  }

  isBossBattle(): boolean { return this.inBossBattle; }
  getState(): QuizState { return this.state; }

  reset(): void {
    this.state = 'menu';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.swordCharge = 0;
    this.inBossBattle = false;
    this.bossCorrect = 0;
    this.loadQuestions();
  }
}

export default QuizEngine;