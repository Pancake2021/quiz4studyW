/**
 * quiz.js — Quiz engine
 * Manages question flow, scoring, timer, and state transitions.
 */

const QuizEngine = (() => {

  // ─── State ────────────────────────────────────────────────────────────────
  let state = {
    questions: [],       // Full shuffled question set
    currentIndex: 0,
    phase: 'question',   // 'question' | 'hint' | 'answer'
    scores: {
      knew: 0,
      hinted: 0,
      didntKnow: 0,
    },
    timerInterval: null,
    secondsLeft: 0,
    mode: null,          // 'topic' | 'sprint' | 'full'
    specialtyId: null,
    categoryName: null,
  };

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init(questions, mode, { specialtyId, categoryName } = {}) {
    state.questions = shuffle([...questions]);
    state.currentIndex = 0;
    state.phase = 'question';
    state.scores = { knew: 0, hinted: 0, didntKnow: 0 };
    state.mode = mode;
    state.specialtyId = specialtyId;
    state.categoryName = categoryName;

    if (mode === 'sprint') {
      state.secondsLeft = 10 * 60; // 10 minutes
      startTimer();
    }

    renderQuestion();
  }

  // ─── Timer ────────────────────────────────────────────────────────────────
  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.secondsLeft--;
      updateTimerUI();
      if (state.secondsLeft <= 0) {
        clearInterval(state.timerInterval);
        showResults();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  function updateTimerUI() {
    const el = document.getElementById('quiz-timer');
    if (!el) return;
    const m = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
    const s = (state.secondsLeft % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
    if (state.secondsLeft <= 60) {
      el.classList.add('urgent');
    }
  }

  // ─── Render question ──────────────────────────────────────────────────────
  function renderQuestion() {
    if (state.currentIndex >= state.questions.length) {
      stopTimer();
      showResults();
      return;
    }

    const q = state.questions[state.currentIndex];
    state.phase = 'question';

    // Progress
    const total = state.questions.length;
    const current = state.currentIndex + 1;
    const pct = Math.round((state.currentIndex / total) * 100);

    _set('quiz-current', current);
    _set('quiz-total', total);
    _set('quiz-progress-fill', null, { width: pct + '%' });

    // Category & question
    _set('quiz-category', q.category);
    _set('quiz-question', q.question);

    // Hide reveal blocks
    _hide('hint-block');
    _hide('answer-block');

    // Show initial action buttons
    _show('actions-initial');
    _hide('actions-after-hint');
    _hide('actions-after-answer');

    // Timer visibility
    const timerEl = document.getElementById('timer-wrap');
    if (timerEl) {
      timerEl.classList.toggle('hidden', state.mode !== 'sprint');
    }
  }

  // ─── Button handlers ──────────────────────────────────────────────────────
  function onKnow() {
    // Show hint first as "bonus context", then reveal answer
    const q = state.questions[state.currentIndex];
    showHint(q.hint);
    showAnswer(q.answer, q.code_examples);

    state.phase = 'answer';
    state.scores.knew++;

    _hide('actions-initial');
    _show('actions-after-answer');
    _set('next-btn-label', 'Следующий вопрос →');
  }

  function onHint() {
    const q = state.questions[state.currentIndex];
    showHint(q.hint);

    state.phase = 'hint';

    _hide('actions-initial');
    _show('actions-after-hint');
  }

  function onDontKnow() {
    const q = state.questions[state.currentIndex];
    showHint(q.hint);
    showAnswer(q.answer, q.code_examples);

    state.phase = 'answer';
    state.scores.didntKnow++;

    _hide('actions-initial');
    _show('actions-after-answer');
    _set('next-btn-label', 'Следующий вопрос →');
  }

  function onHintThenKnow() {
    // After seeing hint, user says they know
    const q = state.questions[state.currentIndex];
    showAnswer(q.answer, q.code_examples);

    state.scores.hinted++;
    state.phase = 'answer';

    _hide('actions-after-hint');
    _show('actions-after-answer');
    _set('next-btn-label', 'Следующий вопрос →');
  }

  function onHintThenDontKnow() {
    // After seeing hint, still doesn't know
    const q = state.questions[state.currentIndex];
    showAnswer(q.answer, q.code_examples);

    state.scores.didntKnow++;
    state.phase = 'answer';

    _hide('actions-after-hint');
    _show('actions-after-answer');
    _set('next-btn-label', 'Следующий вопрос →');
  }

  function onNext() {
    state.currentIndex++;
    renderQuestion();
    // Scroll to top of question card
    const card = document.getElementById('question-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ─── Show hint / answer ───────────────────────────────────────────────────
  function showHint(hintText) {
    _set('hint-text', hintText);
    _show('hint-block');
  }

  function showAnswer(answerText, codeExamples) {
    _set('answer-text', answerText);

    // Code examples
    const codeWrap = document.getElementById('code-wrap');
    if (codeWrap) {
      if (codeExamples && codeExamples.length > 0) {
        codeWrap.innerHTML = codeExamples
          .map(c => `<pre class="code-block">${escapeHtml(c)}</pre>`)
          .join('');
        codeWrap.classList.remove('hidden');
      } else {
        codeWrap.classList.add('hidden');
      }
    }

    _show('answer-block');
  }

  // ─── Results ──────────────────────────────────────────────────────────────
  function showResults() {
    const total = state.currentIndex; // Questions answered
    const { knew, hinted, didntKnow } = state.scores;
    const knewPct = total > 0 ? Math.round(((knew + hinted) / total) * 100) : 0;

    // Save to sessionStorage for results page
    sessionStorage.setItem('quiz_results', JSON.stringify({
      total,
      knew,
      hinted,
      didntKnow,
      knewPct,
      mode: state.mode,
      categoryName: state.categoryName,
    }));

    window.location.href = 'results.html';
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _set(id, text, styles) {
    const el = document.getElementById(id);
    if (!el) return;
    if (text !== null && text !== undefined) el.textContent = text;
    if (styles) Object.assign(el.style, styles);
  }

  function _show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function _hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
    init,
    onKnow,
    onHint,
    onDontKnow,
    onHintThenKnow,
    onHintThenDontKnow,
    onNext,
  };
})();
