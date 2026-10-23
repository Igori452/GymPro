const questions = [{
    question: "Если человека назвали мордофиля, то это…",
    text: "Ну зачем же вы так... В Этимологическом словаре русского языка Макса Фасмера поясняется, что мордофилей называют чванливого человека. Ну а «чванливый» — это высокомерный, тщеславный.",
    answer_lst: [
        {text: "Значит, что он тщеславный.", flag: true},
        {text: "Значит, что у него лицо как у хряка.", flag: false},
        {text: "Значит, что чумазый.", flag: false},
    ],
}, 
{
    question: "«Да этот Ярополк — фуфлыга!» Что не так с Ярополком?",
    text: " Точно! Словарь Даля говорит, что фуфлыгой называют невзрачного малорослого человека. А еще так называют прыщи.",
    answer_lst: [
        {text: "Он маленький и невзрачный.", flag: true},
        {text: "Он тот еще алкоголик.", flag: false},
        {text: "Он не держит свое слово.", flag: false},
    ],  
}, 
{
    question: "Если человека прозвали пятигузом, значит, он…",
    text: "Может сесть сразу на пять стульев. Согласно Этимологическому словарю русского языка Макса Фасмера, пятигуз — это ненадежный, непостоянный человек.",
    answer_lst: [
        {text: "Не держит слово.", flag: true},
        {text: "Изменяет жене.", flag: false},
        {text: "Без гроша в кармане.", flag: false},
    ],
}, 
{
    question: "Кто такой шлындра?",
    text: "Да! В Словаре русского арго «шлындрать» означает бездельничать, шляться.",
    answer_lst: [
        {text: "Обманщик.", flag: false},
        {text: "Нытик.", flag: false},
        {text: "Бродяга.", flag: true},
    ],
}, 
{
    question: "В каком случае про человека можно сказать, что он охренел (в смысле \"обнаглел/перешёл границы\"), а не просто удивился?",
    text: "Слово «охренел» многозначно, оно означает «обнаглел, потерял совесть»",
    answer_lst: [
        {text: "Он без спроса берёт твои вещи и делает вид, что так и надо.", flag: true},
        {text: "Он в наглую лезет без очереди и ещё возмущается, что его не пропускают.", flag: true},
        {text: "Он съел много хрена и искренне удивился: «Какой жгучий, вот это да!»", flag: false},
        {text: "В осеннем лесу наблюдается завихрение листьев.", flag: false},
    ],
}];


const listEl = document.querySelector('.poll-block--questions-list');
const nameEl = document.querySelector('.poll-block--name');

let correctCount = 0;
let answeredCount = 0;
const total = questions.length;
let currentQuestionIndex = 0;
let questionsShuffled = [];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuestion(q, index) {
  const li = document.createElement('li');
  li.id = 'question-' + (index + 1);
  li.dataset.index = index;

  const qText = document.createElement('div');
  qText.id = 'question-text';
  qText.textContent = q.question;
  li.appendChild(qText);

  const row = document.createElement('div');
  row.className = 'answers-row';

  const answers = shuffle(q.answer_lst);

  answers.forEach((ans, i) => {
    const div = document.createElement('div');
    div.id = 'answer-' + (i + 1);
    div.className = 'answer';

    const label = document.createElement('span');
    label.className = 'answer-label';
    label.textContent = ans.text;
    div.appendChild(label);

    if (ans.flag) {
      const explain = document.createElement('div');
      explain.className = 'explain';
      explain.textContent = q.text;
      div.appendChild(explain);
    }

    div.addEventListener('click', () => handleAnswer(li, div, ans, index));

    row.appendChild(div);
  });

  li.appendChild(row);
  return li;
}

function handleAnswer(li, answerEl, ans, index) {
  if (index !== currentQuestionIndex) return;
  if (li.classList.contains('done')) return;

  li.classList.add('done');
  answeredCount++;

  answerEl.classList.add('shake');
  setTimeout(() => answerEl.classList.remove('shake'), 400);

  const allAnswers = Array.from(li.querySelectorAll('.answer'));
  const order = allAnswers;

  if (ans.flag) {
    li.classList.add('correct');
    correctCount++;
    answerEl.classList.add('correct-expanded');
    setTimeout(() => answerEl.classList.add('explain-fade'), 2400);
  } else {
    li.classList.add('incorrect');
  }

  order.forEach((a, i) => {
    setTimeout(() => a.classList.add('move-down'), 2000 + i * 350);
  });

  const markerDelay = 2000 + order.length * 350 + 200;
  setTimeout(() => li.classList.add('marker-visible'), markerDelay);

  if (answeredCount === total) {
    setTimeout(enableReview, markerDelay + 300);
  } else {
    currentQuestionIndex++;
    setTimeout(() => {
      const nextIndex = currentQuestionIndex;
      listEl.appendChild(renderQuestion(questionsShuffled[nextIndex], nextIndex));
      highlightCurrent();
    }, markerDelay + 300);
  }

  updateStats();
}

function highlightCurrent() {
  document.querySelectorAll('.poll-block--questions-list li').forEach(li => {
    li.style.outline = '';
  });
  const cur = document.getElementById('question-' + (currentQuestionIndex + 1));
}

function updateStats() {
  if (answeredCount === total) {
    nameEl.textContent = `Вопросы закончились. Правильных ответов: ${correctCount} из ${total}`;
  } else {
    nameEl.textContent = `Вопрос ${currentQuestionIndex + 1} из ${total}`;
  }
}

function enableReview() {
  document.querySelectorAll('.poll-block--questions-list li').forEach(li => {
    li.style.outline = '';
    li.addEventListener('click', function reviewClick(e) {
      if (e.target.closest('.answer')) return;
      showCorrectFor(li);
    });
  });
}

function showCorrectFor(li) {
  document.querySelectorAll('.poll-block--questions-list li').forEach(other => {
    other.querySelectorAll('.answer').forEach(a => {
      a.classList.add('move-down');
      a.style.opacity = '';
      const ex = a.querySelector('.explain');
      if (ex) {
        ex.style.maxHeight = '';
        ex.style.opacity = '';
        ex.style.marginTop = '';
      }
    });
  });

  const idx = Number(li.dataset.index);
  const q = questionsShuffled[idx];
  const answers = li.querySelectorAll('.answer');

  answers.forEach(a => {
    const label = a.querySelector('.answer-label');
    const text = label ? label.textContent : '';
    const found = q.answer_lst.find(x => x.text === text);

    if (found && found.flag) {
      a.classList.remove('move-down');
      a.style.opacity = '1';

      const ex = a.querySelector('.explain');
      if (ex) {
        ex.style.maxHeight = '220px';
        ex.style.opacity = '1';
        ex.style.marginTop = '10px';
      }
    }
  });
}

function init() {
  questionsShuffled = shuffle(questions);

  listEl.appendChild(renderQuestion(questionsShuffled[0], 0));

  currentQuestionIndex = 0;
  highlightCurrent();
  updateStats();
}

init();