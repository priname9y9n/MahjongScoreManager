'use strict';

// ===== Supabase 設定（README の手順で作成したプロジェクトの値を入れてください） =====
const SUPABASE_URL = 'https://hddqknaorkdylpbwketi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AwJfFfMpMT-_vThxoGOwYA_fTlVa-d-';
const db = SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 点数表（雀魂準拠・切り上げ満貫なし）。キーは飜数。
// p = 親のロン点 / 親ツモ時に子1人が支払う点
// c = 子のロン点 / 子ツモ時の「親の支払点・子の支払点」
const scoreRows = [
  { fu: 20, p: { 1: null, 2: [2000, 700], 3: [3900, 1300], 4: [7700, 2600] }, c: { 1: null, 2: [1300, 700, 400], 3: [2600, 1300, 700], 4: [5200, 2600, 1300] } },
  { fu: 25, p: { 1: null, 2: [2400, 800], 3: [4800, 1600], 4: [9600, 3200] }, c: { 1: null, 2: [1600, 800, 400], 3: [3200, 1600, 800], 4: [6400, 3200, 1600] } },
  { fu: 30, p: { 1: [1500, 500], 2: [2900, 1000], 3: [5800, 2000], 4: [11600, 3900] }, c: { 1: [1000, 500, 300], 2: [2000, 1000, 500], 3: [3900, 2000, 1000], 4: [7700, 3900, 2000] } },
  { fu: 40, p: { 1: [2000, 700], 2: [3900, 1300], 3: [7700, 2600], 4: [12000, 4000] }, c: { 1: [1300, 700, 400], 2: [2600, 1300, 700], 3: [5200, 2600, 1300], 4: [8000, 4000, 2000] } },
  { fu: 50, p: { 1: [2400, 800], 2: [4800, 1600], 3: [9600, 3200], 4: [12000, 4000] }, c: { 1: [1600, 800, 400], 2: [3200, 1600, 800], 3: [6400, 3200, 1600], 4: [8000, 4000, 2000] } },
  { fu: 60, p: { 1: [2900, 1000], 2: [5800, 2000], 3: [11600, 3900], 4: [12000, 4000] }, c: { 1: [2000, 1000, 500], 2: [3900, 2000, 1000], 3: [7700, 3900, 2000], 4: [8000, 4000, 2000] } },
  { fu: 70, p: { 1: [3400, 1200], 2: [6800, 2300], 3: [12000, 4000], 4: [12000, 4000] }, c: { 1: [2300, 1200, 600], 2: [4500, 2300, 1200], 3: [8000, 4000, 2000], 4: [8000, 4000, 2000] } },
  { fu: 80, p: { 1: [3900, 1300], 2: [7700, 2600], 3: [12000, 4000], 4: [12000, 4000] }, c: { 1: [2600, 1300, 700], 2: [5200, 2600, 1300], 3: [8000, 4000, 2000], 4: [8000, 4000, 2000] } },
  { fu: 90, p: { 1: [4400, 1500], 2: [8700, 2900], 3: [12000, 4000], 4: [12000, 4000] }, c: { 1: [2900, 1500, 800], 2: [5800, 2900, 1500], 3: [8000, 4000, 2000], 4: [8000, 4000, 2000] } },
  { fu: 100, p: { 1: [4800, 1600], 2: [9600, 3200], 3: [12000, 4000], 4: [12000, 4000] }, c: { 1: [3200, 1600, 800], 2: [6400, 3200, 1600], 3: [8000, 4000, 2000], 4: [8000, 4000, 2000] } },
  { fu: 110, p: { 1: [5300, 1800], 2: [10600, 3600], 3: [12000, 4000], 4: [12000, 4000] }, c: { 1: [3600, 1800, 900], 2: [7100, 3600, 1800], 3: [8000, 4000, 2000], 4: [8000, 4000, 2000] } }
];

const limitScores = [
  { key: 'mangan', label: '5飜（満貫）', p: [12000, 4000], c: [8000, 4000, 2000] },
  { key: 'haneman', label: '6〜7飜（跳満）', p: [18000, 6000], c: [12000, 6000, 3000] },
  { key: 'baiman', label: '8〜10飜（倍満）', p: [24000, 8000], c: [16000, 8000, 4000] },
  { key: 'sanbaiman', label: '11〜12飜（三倍満）', p: [36000, 12000], c: [24000, 12000, 6000] },
  { key: 'yakuman', label: '13飜以上（役満）', p: [48000, 16000], c: [32000, 16000, 8000] }
];

const yakuGroups = [
  { label: '1飜', list: ['立直', '一発', '門前清自摸和', '断么九', '平和', '一盃口', '役牌 白', '役牌 發', '役牌 中', '自風牌', '場風牌', '嶺上開花', '槍槓', '海底摸月', '河底撈魚'] },
  { label: '2飜', list: ['ダブル立直', '三色同順', '一気通貫', '混全帯么九', '七対子', '対々和', '三暗刻', '三色同刻', '三槓子', '小三元', '混老頭'] },
  { label: '3飜', list: ['二盃口', '純全帯么九', '混一色'] },
  { label: '6飜', list: ['清一色'] },
  { label: '役満', list: ['国士無双', '四暗刻', '大三元', '字一色', '小四喜', '大四喜', '緑一色', '清老頭', '四槓子', '九蓮宝燈', '天和', '地和'] }
];

const players = ['east', 'south', 'west', 'north'];
const seatLabel = { east: '東家', south: '南家', west: '西家', north: '北家' };
const winds = ['東', '南', '西'];
const STORAGE_KEY = 'mahjongScoreManagerState_v2';

let game = createNewGame();   // 途中対局はログイン後にそのアカウントの分を読み込む
let loadedKey = '';           // 今読み込んでいる途中対局の保存先
let modalState = null;
let user = null;      // ログイン中のアカウント { id, nickname }
let guest = false;    // ログインせずに利用中
let saving = false;
let saveError = '';

function createNewGame(names, mySeat) {
  return {
    names: names || { east: '', south: '', west: '', north: '' },
    mySeat: mySeat === undefined ? 'east' : mySeat,   // 自分の席（'' は記録しない）
    meCalled: false,                                    // この局で自分が鳴いたか
    scores: { east: 25000, south: 25000, west: 25000, north: 25000 },
    parent: 'east', windIndex: 0, handNo: 1,
    honba: 0, kyotaku: 0, riichi: [],
    history: [], undo: [],
    started: false, finished: false, saved: false,
    endMessage: '', status: ''
  };
}

// 途中対局はアカウントごとに保存する。
// ゲストはタブごとの一時保存（sessionStorage）：タブを閉じると消え、別タブのゲスト同士も混ざらない
const storageKey = () => `${STORAGE_KEY}:${user ? user.id : 'guest'}`;
const gameStore = () => (user ? localStorage : sessionStorage);

function loadGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);              // 旧版の共有保存データは使わない
    localStorage.removeItem(`${STORAGE_KEY}:guest`);   // 旧版のゲスト保存データも使わない
    const s = JSON.parse(gameStore().getItem(storageKey()));
    if (s && s.scores && players.every((k) => Number.isFinite(s.scores[k])) && players.includes(s.parent) &&
        [0, 1, 2].includes(s.windIndex) && [1, 2, 3, 4].includes(s.handNo) && Array.isArray(s.history)) {
      return Object.assign(createNewGame(), s);
    }
  } catch (error) { /* 読めない保存データは破棄して新規対局にします */ }
  return createNewGame();
}

function saveGame() {
  if (!loadedKey) return;   // ログイン前は保存しない
  try { gameStore().setItem(loadedKey, JSON.stringify(game)); } catch (error) { /* 保存できなくても対局は続行 */ }
}

const $ = (id) => document.getElementById(id);
const cap = (k) => k[0].toUpperCase() + k.slice(1);
const fmt = (v) => Number(v).toLocaleString('ja-JP');
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nm = (k) => game.names[k] || seatLabel[k];
const roundName = () => `${winds[game.windIndex]}${'一二三四'[game.handNo - 1]}局`;
const roundLabel = () => roundName() + (game.honba ? ` ${game.honba}本場` : '');
const nextPlayer = (k) => players[(players.indexOf(k) + 1) % 4];
// 同点は起家（東家）に近い順。Array#sort は安定ソート。
const ranking = (scores = game.scores) => players.slice().sort((a, b) => scores[b] - scores[a]);

// ===== 画面切り替え =====
function showScreen(id) {
  ['authScreen', 'setupScreen', 'gameScreen'].forEach((s) => $(s).classList.toggle('hidden', s !== id));
  $('topbar').classList.toggle('hidden', id === 'authScreen');
  $('userLabel').textContent = user ? `${user.nickname} さん` : 'ゲスト';
  $('recordsButton').classList.toggle('hidden', !user);
  $('statsButton').classList.toggle('hidden', !user);
  $('logoutButton').textContent = user ? 'ログアウト' : 'ログイン画面へ';
}

function route() {
  if (!user && !guest) { showScreen('authScreen'); return; }
  if (loadedKey !== storageKey()) {   // アカウントが変わったら、そのアカウントの途中対局に切り替える
    if (modalState) closeModal();
    game = loadGame();
    loadedKey = storageKey();
    saveError = '';
  }
  if (game.started) { showScreen('gameScreen'); renderGame(); return; }
  players.forEach((k) => { $(`name${cap(k)}`).value = game.names[k]; $(`me${cap(k)}`).checked = game.mySeat === k; });
  $('meNone').checked = !game.mySeat;
  showScreen('setupScreen');
}

function goSetup() {
  game = createNewGame(game.names, game.mySeat);
  saveError = '';
  saveGame();
  route();
}

// ===== アカウント（ニックネーム + パスワード） =====
// Supabase Auth はメール形式が必要なため、ニックネームのハッシュから内部用アドレスを作ります。
function nicknameEmail(nickname) {
  const norm = nickname.normalize('NFKC').trim().toLowerCase();
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm)).then((buf) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40) + '@example.com');
}

function setUser(session) {
  user = session ? { id: session.user.id, nickname: session.user.user_metadata.nickname || 'プレイヤー' } : null;
}

function loggedIn(session) {
  setUser(session);
  $('passInput').value = '';
  guest = false;
  route();
}

function submitAuth(event) {
  event.preventDefault();
  const msg = (t) => { $('authMessage').textContent = t; };
  if (!db) { msg('Supabase が未設定のため、ログインできません。'); return; }
  const nickname = $('nickInput').value.trim();
  const password = $('passInput').value;
  if (!nickname || password.length < 6) { msg('ニックネームと6文字以上のパスワードを入力してください。'); return; }

  $('authSubmit').disabled = true;
  msg('');
  let email = '';
  Promise.resolve()
    .then(() => nicknameEmail(nickname))
    .then((e) => { email = e; return db.rpc('nickname_taken', { e: email }); })
    .then((res) => {
      if (res.error) throw res.error;
      if (res.data) {
        return db.auth.signInWithPassword({ email: email, password: password }).then((r) => {
          if (r.error) { msg('ニックネームまたはパスワードが違います。'); return; }
          loggedIn(r.data.session);
        });
      }
      if (!window.confirm(`「${nickname}」は新しいニックネームです。このニックネームで新規登録しますか？`)) return;
      return db.auth.signUp({ email: email, password: password, options: { data: { nickname: nickname } } }).then((r) => {
        if (r.error) { msg(`登録できませんでした：${r.error.message}`); return; }
        if (!r.data.session) { msg('Supabase のメール確認が有効になっています。README の手順で無効にしてください。'); return; }
        loggedIn(r.data.session);
      });
    })
    .catch((error) => { msg(`通信に失敗しました：${error.message || error}`); })
    .then(() => { $('authSubmit').disabled = false; });
}

// ===== 対局画面 =====
function renderGame() {
  $('roundBadge').textContent = roundLabel();
  $('centerRound').textContent = roundName();
  $('centerInfo').textContent = `親：${nm(game.parent)}`;
  $('centerSticks').textContent = `${game.honba}本場 ・ 供託 ${game.kyotaku}本`;

  players.forEach((key) => {
    const parent = game.parent === key;
    const seat = $(`seat${cap(key)}`);
    seat.className = `seat-card seat-${key}${parent ? ' is-parent' : ''}`;
    seat.innerHTML = `
      <div class="seat-topline"><span class="seat-wind">${seatLabel[key]}</span>
        <span>${game.mySeat === key ? '<span class="badge me">あなた</span>' : ''}${parent ? '<span class="badge dealer">親</span>' : ''}${game.riichi.includes(key) ? '<span class="badge riichi">リーチ</span>' : ''}${game.mySeat === key && game.meCalled ? '<span class="badge called">鳴き</span>' : ''}</span></div>
      <div class="seat-name">${esc(nm(key))}</div>
      <div class="seat-score">${fmt(game.scores[key])}<span class="seat-unit">点</span></div>`;
  });

  $('historyCount').textContent = `${game.history.length}件`;
  $('historyList').innerHTML = game.history.length ? historyHtml(game.history.slice().reverse()) : '<p class="empty-history">まだ履歴はありません。</p>';

  ['winButton', 'riichiButton', 'drawButton', 'callButton'].forEach((id) => { $(id).disabled = game.finished; });
  $('callButton').classList.toggle('hidden', !game.mySeat);
  $('callButton').classList.toggle('is-on', game.meCalled);
  $('callButton').textContent = game.meCalled ? '鳴き済み' : '鳴き（自分）';
  $('undoButton').disabled = !game.undo.length || game.saved || saving;
  $('gameStatus').textContent = game.status || '和了・リーチ・流局を入力して対局を進めてください。';

  $('gameOverPanel').classList.toggle('hidden', !game.finished);
  if (game.finished) {
    $('gameOverMessage').textContent = game.endMessage;
    $('rankingList').innerHTML = ranking().map((k, i) => `<li><span class="rank">${i + 1}位</span><span class="rank-name">${esc(nm(k))}</span><strong>${fmt(game.scores[k])}点</strong></li>`).join('');
    $('saveButton').classList.toggle('hidden', !user || game.saved);
    $('saveButton').disabled = saving;
    $('saveButton').textContent = saving ? '保存中…' : '牌譜を保存';
    $('saveStatus').textContent = game.saved ? '✓ 牌譜を保存しました。上部の「牌譜」から確認・削除できます。'
      : !user ? 'ログインしていないため、牌譜は保存されません。' : saveError;
    $('saveStatus').classList.toggle('ok', game.saved);
  }
  saveGame();
}

function historyHtml(items) {
  return items.map((item) => `<div class="history-item"><span class="history-round">${esc(item.round)}</span><span class="history-desc">${esc(item.description)}</span><span class="history-points">${esc(item.detail)}</span></div>`).join('');
}

// hand：成績集計用の局データ（和了 / 流局）
function addHistory(description, detail, hand) {
  game.history.push({ round: roundLabel(), description: description, detail: detail, hand: hand });
}

// 「ひとつ戻す」用に直前の状態を保存
function snapshot() {
  const undo = game.undo;
  undo.push(JSON.stringify(Object.assign({}, game, { undo: undefined })));  // undefined は JSON に残らない
  if (undo.length > 50) undo.shift();
}

function undoLast() {
  if (!game.undo.length || game.saved || saving) return;
  const undo = game.undo;
  game = Object.assign(JSON.parse(undo.pop()), { undo: undo });
  saveError = '';
  renderGame();
}

// 局の終了処理：親の移動・終局判定（雀魂ルール）
function endHand(dealerStays) {
  game.riichi = [];
  game.meCalled = false;
  const wasWind = game.windIndex;
  const wasNo = game.handNo;
  const next = { parent: game.parent, windIndex: wasWind, handNo: wasNo };
  if (!dealerStays) {
    next.parent = nextPlayer(game.parent);
    next.handNo += 1;
    if (next.handNo > 4) { next.handNo = 1; next.windIndex += 1; }
  }
  const top = ranking()[0];
  const max = game.scores[top];
  const allLast = wasWind === 1 && wasNo === 4;

  let end = '';
  if (players.some((k) => game.scores[k] < 0)) end = '持ち点が0点未満のプレイヤーが出たため、対局を終了します。';
  else if (wasWind === 2 && max >= 30000) end = '西入後に30,000点以上のプレイヤーが出たため、対局を終了します。';
  else if (next.windIndex === 3) end = '西四局が終了したため、対局を終了します。';
  else if (allLast && dealerStays && top === game.parent && max >= 30000) end = 'オーラスで親がトップ（30,000点以上）のため、対局を終了します。';
  else if (allLast && !dealerStays && max >= 30000) end = '南四局終了時に30,000点以上のプレイヤーがいるため、対局を終了します。';

  if (end) {
    if (game.kyotaku) {
      game.scores[top] += game.kyotaku * 1000;
      end += ` 残りの供託${game.kyotaku}本はトップの${nm(top)}が受け取ります。`;
      game.kyotaku = 0;
    }
    game.finished = true;
    game.endMessage = game.status = end;
  } else {
    Object.assign(game, next);
    if (dealerStays) game.status = `${nm(game.parent)}（親）の連荘です。${roundLabel()}を続けます。`;
    else if (allLast) game.status = `全員30,000点未満のため西入します。次は${roundLabel()}です。`;
    else game.status = `親が${nm(game.parent)}へ移動しました。次は${roundLabel()}です。`;
  }
  renderGame();
}

// ===== モーダル =====
function openModal(state) {
  if (game.finished) return;
  modalState = state;
  renderModal();
  $('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  $('modalOverlay').classList.add('hidden');
  modalState = null;
}

function choiceButtons(keys, action, small, isDisabled = () => false, isOn = () => false) {
  return `<div class="choice-grid">${keys.map((k) => `<button class="choice-button${isOn(k) ? ' is-on' : ''}" data-action="${action}" data-player="${k}" ${isDisabled(k) ? 'disabled' : ''}>${esc(nm(k))}<span class="choice-small">${small(k)}</span></button>`).join('')}</div>`;
}

function renderModal() {
  if (!modalState) return;
  const s = modalState;
  const pts = (k) => `${seatLabel[k]} ・ ${fmt(game.scores[k])}点`;
  let title = '';
  let html = '';

  if (s.mode === 'riichi') {
    title = 'リーチ';
    html = `<p class="modal-intro">リーチしたプレイヤーを選んでください。1,000点を供託します（持ち点1,000点未満は不可）。</p>
      ${choiceButtons(players, 'declare-riichi', (k) => game.riichi.includes(k) ? 'リーチ済み' : pts(k), (k) => game.riichi.includes(k) || game.scores[k] < 1000)}
      <div class="modal-footer-actions"><button class="text-button" data-action="cancel">キャンセル</button></div>`;
  } else if (s.mode === 'draw') {
    const n = s.tenpai.length;
    const info = n === 0 || n === 4 ? `聴牌 ${n}人：点数移動なし`
      : `聴牌 ${n}人：聴牌者 +${fmt(3000 / n)}点 ／ ノーテン −${fmt(3000 / (4 - n))}点`;
    title = '流局：聴牌者を選択';
    html = `<p class="modal-intro">テンパイしていたプレイヤーを選んでください（リーチ者は自動で聴牌）。ノーテン罰符 3,000点を精算します。親が聴牌なら1本積んで連荘、ノーテンなら0本に戻して親が交代します。</p>
      ${choiceButtons(players, 'toggle-tenpai', (k) => game.riichi.includes(k) ? 'リーチ中' : (s.tenpai.includes(k) ? '聴牌' : 'ノーテン'), (k) => game.riichi.includes(k), (k) => s.tenpai.includes(k))}
      <div class="score-selection-info">${info}</div>
      <div class="modal-footer-actions"><button class="text-button" data-action="cancel">キャンセル</button><button class="primary-button" data-action="settle-draw">精算して次局へ</button></div>`;
  } else {
    const summary = s.winner ? `<div class="selected-summary"><strong>和了者：${esc(nm(s.winner))}</strong><span>（${s.winner === game.parent ? '親' : '子'}）</span>${s.method ? `<span>／ ${s.method === 'ron' ? 'ロン' : 'ツモ'}</span>` : ''}${s.loser ? `<span>／ 放銃者：${esc(nm(s.loser))}</span>` : ''}</div>` : '';
    const back = '<div class="modal-footer-actions"><button class="text-button" data-action="back">戻る</button></div>';
    if (s.step === 'winner') {
      title = '① 和了した人';
      html = `${choiceButtons(players, 'select-winner', (k) => (k === game.parent ? '親 ・ ' : '') + fmt(game.scores[k]) + '点')}
        <div class="modal-footer-actions"><button class="text-button" data-action="cancel">キャンセル</button></div>`;
    } else if (s.step === 'method') {
      title = '② ロン・ツモ';
      html = `${summary}<div class="method-grid">
        <button class="method-button" data-action="select-method" data-method="ron"><strong>ロン</strong><span>放銃した人から受け取ります。</span></button>
        <button class="method-button" data-action="select-method" data-method="tsumo"><strong>ツモ</strong><span>他の3人から受け取ります。</span></button>
        </div>${back}`;
    } else if (s.step === 'loser') {
      title = '③ 放銃した人';
      html = `${summary}${choiceButtons(players.filter((k) => k !== s.winner), 'select-loser', pts)}${back}`;
    } else if (s.step === 'score') {
      title = '④ 飜数・符数';
      html = summary + renderScorePicker();
    } else {
      title = '⑤ 役と鳴き';
      const ready = s.naki !== null;
      html = `${summary}
        <p class="modal-intro">鳴きの有無を選び、和了した役をすべて選んでください。役を記録しない場合は「役をスキップ」を押してください。</p>
        <div class="naki-row">
          <button class="choice-button${s.naki === false ? ' is-on' : ''}" data-action="select-naki" data-naki="no">鳴きなし（門前）</button>
          <button class="choice-button${s.naki === true ? ' is-on' : ''}" data-action="select-naki" data-naki="yes">鳴きあり</button>
        </div>
        ${yakuGroups.map((g) => `<div class="yaku-group"><span class="yaku-label">${g.label}</span><div class="yaku-list">${g.list.map((y) => `<button class="yaku-chip${s.yaku.includes(y) ? ' is-on' : ''}" data-action="toggle-yaku" data-yaku="${y}">${y}</button>`).join('')}</div></div>`).join('')}
        <div class="score-selection-info">${ready ? '' : '鳴きの有無を選んでください。'}${s.yaku.length ? `選択中の役：${s.yaku.join('・')}` : (ready ? '役が未選択です。' : '')}</div>
        <div class="modal-footer-actions"><button class="text-button" data-action="back">戻る</button>
          <span class="footer-buttons"><button class="secondary-button" data-action="skip-yaku" ${ready ? '' : 'disabled'}>役をスキップ</button>
          <button class="primary-button" data-action="settle" ${ready && s.yaku.length ? '' : 'disabled'}>精算する</button></span></div>`;
    }
  }
  $('modalTitle').textContent = title;
  $('modalContent').innerHTML = html;
}

function paymentText(values, side, method) {
  if (method === 'ron') return `ロン ${fmt(values[0])}点`;
  return side === 'p' ? `ツモ 各${fmt(values[1])}点` : `ツモ 親${fmt(values[1])}点／子${fmt(values[2])}点`;
}

function renderScorePicker() {
  const side = modalState.winner === game.parent ? 'p' : 'c';
  const selected = modalState.score;
  const hans = side === 'p' ? [4, 3, 2, 1] : [1, 2, 3, 4];

  const cell = (row, han) => {
    const val = row[side][han];
    if (!val) return '<td><div class="score-empty"></div></td>';
    const on = selected && selected.kind === 'grid' && selected.fu === row.fu && selected.han === han;
    const main = val[0] === 12000 || val[0] === 8000 ? '満貫' : fmt(val[0]);
    const sub = side === 'p' ? `（${fmt(val[1])}）` : `（${fmt(val[1])}/${fmt(val[2])}）`;
    return `<td><button class="score-option${on ? ' is-selected' : ''}" data-action="select-grid-score" data-fu="${row.fu}" data-han="${han}"><strong>${main}</strong><small>${sub}</small></button></td>`;
  };

  const matrix = `<div class="score-table-wrap"><table class="score-matrix">
    <thead><tr><th class="fu-head">符</th>${hans.map((h) => `<th>${h}飜</th>`).join('')}</tr></thead>
    <tbody>${scoreRows.map((row) => `<tr><th class="fu-cell">${row.fu}</th>${hans.map((h) => cell(row, h)).join('')}</tr>`).join('')}</tbody>
  </table></div>`;

  const limits = `<div class="limit-grid">${limitScores.map((item, i) => {
    const v = item[side];
    const on = selected && selected.kind === 'limit' && selected.key === item.key;
    return `<button class="score-option${on ? ' is-selected' : ''}" data-action="select-limit-score" data-index="${i}"><small>${item.label}</small><strong>${fmt(v[0])}</strong></button>`;
  }).join('')}</div>`;

  const info = selected
    ? `選択中：${selected.kind === 'grid' ? `${selected.han}飜${selected.fu}符` : selected.label} ／ <strong>${paymentText(selected.values, side, modalState.method)}</strong>${game.honba ? `（＋${game.honba}本場）` : ''}`
    : '該当する点数を選んでください。';
  const help = side === 'p' ? '親の点数表です。括弧内はツモ時に子1人が支払う点数です。' : '子の点数表です。括弧内はツモ時の「親／子」の支払点です。';

  return `<p class="modal-intro">${help}</p>${limits}${matrix}
    <div class="score-selection-info">${info}</div>
    <div class="modal-footer-actions"><button class="text-button" data-action="back">戻る</button><button class="primary-button" data-action="to-yaku" ${selected ? '' : 'disabled'}>次へ（役・鳴き）</button></div>`;
}

function handleModalClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || !modalState) return;
  const s = modalState;
  const action = button.dataset.action;
  const player = button.dataset.player;

  if (action === 'cancel') { closeModal(); return; }
  if (action === 'delete-record') { deleteRecord(button.dataset.id); return; }
  if (action === 'declare-riichi') {
    snapshot();
    game.scores[player] -= 1000;
    game.kyotaku += 1;
    game.riichi.push(player);
    game.status = `${nm(player)}がリーチしました（供託 ${game.kyotaku}本）。`;
    closeModal(); renderGame(); return;
  }
  if (action === 'toggle-tenpai') {
    s.tenpai = s.tenpai.includes(player) ? s.tenpai.filter((k) => k !== player) : s.tenpai.concat([player]);
    renderModal(); return;
  }
  if (action === 'settle-draw') { settleDraw(); return; }
  if (action === 'back') {
    if (s.step === 'method') s.step = 'winner';
    else if (s.step === 'loser') s.step = 'method';
    else if (s.step === 'score') { s.step = s.method === 'ron' ? 'loser' : 'method'; s.score = null; }
    else if (s.step === 'yaku') s.step = 'score';
    renderModal(); return;
  }
  if (action === 'to-yaku' && s.score) {
    if (s.yaku === null) {
      // リーチ者は「立直・鳴きなし」、自分が鳴いた局なら「鳴きあり」を初期選択
      const riichi = game.riichi.includes(s.winner);
      s.yaku = riichi ? ['立直'] : [];
      s.naki = riichi ? false : (s.winner === game.mySeat && game.meCalled ? true : null);
    }
    s.step = 'yaku';
    renderModal(); return;
  }
  if (action === 'select-naki') { s.naki = button.dataset.naki === 'yes'; renderModal(); return; }
  if (action === 'toggle-yaku') {
    const y = button.dataset.yaku;
    s.yaku = s.yaku.includes(y) ? s.yaku.filter((x) => x !== y) : s.yaku.concat([y]);
    renderModal(); return;
  }
  if (action === 'skip-yaku' && s.naki !== null) { s.yaku = []; settleWin(); return; }
  if (action === 'select-winner') { s.winner = player; s.loser = null; s.yaku = null; s.naki = null; s.step = 'method'; renderModal(); return; }
  if (action === 'select-method') { s.method = button.dataset.method; s.step = s.method === 'ron' ? 'loser' : 'score'; renderModal(); return; }
  if (action === 'select-loser') { s.loser = player; s.step = 'score'; renderModal(); return; }

  const side = s.winner === game.parent ? 'p' : 'c';
  if (action === 'select-grid-score') {
    const fu = Number(button.dataset.fu);
    const han = Number(button.dataset.han);
    s.score = { kind: 'grid', fu, han, values: scoreRows.find((r) => r.fu === fu)[side][han] };
    renderModal(); return;
  }
  if (action === 'select-limit-score') {
    const item = limitScores[Number(button.dataset.index)];
    s.score = { kind: 'limit', key: item.key, label: item.label, values: item[side] };
    renderModal(); return;
  }
  if (action === 'settle' && s.score && s.naki !== null && s.yaku.length) settleWin();
}

// 和了の精算：本場は ロン300点×本場 / ツモ1人100点×本場、供託は和了者が総取り
function settleWin() {
  const { winner, method, loser, score, yaku, naki } = modalState;
  const v = score.values;
  const dealerWin = winner === game.parent;
  const bonus = 100 * game.honba;
  const sticks = game.kyotaku * 1000;
  snapshot();

  let gain = 0;
  let detail = '';
  if (method === 'ron') {
    gain = v[0] + 3 * bonus;
    game.scores[loser] -= gain;
    detail = `${nm(loser)} → ${nm(winner)}：${fmt(gain)}点`;
  } else {
    players.filter((k) => k !== winner).forEach((k) => {
      const pay = (dealerWin ? v[1] : (k === game.parent ? v[1] : v[2])) + bonus;
      game.scores[k] -= pay;
      gain += pay;
    });
    detail = dealerWin ? `子から各${fmt(v[1] + bonus)}点（計${fmt(gain)}点）`
      : `親${fmt(v[1] + bonus)}点・子各${fmt(v[2] + bonus)}点（計${fmt(gain)}点）`;
  }
  game.scores[winner] += gain + sticks;
  if (sticks) detail += ` ＋供託${fmt(sticks)}点`;

  const label = score.kind === 'grid' ? `${score.han}飜${score.fu}符` : score.label;
  // 和了点（本場・供託を除いた手の点数）
  const points = method === 'ron' ? v[0] : (dealerWin ? v[1] * 3 : v[1] + v[2] * 2);
  addHistory(`${nm(winner)}が和了：${method === 'ron' ? `ロン（放銃：${nm(loser)}）` : 'ツモ'}／${label}／${yaku.length ? yaku.join('・') : '役未入力'}（${naki ? '鳴きあり' : '鳴きなし'}）`, detail, {
    type: 'win', winner: winner, loser: method === 'ron' ? loser : null, method: method, points: points,
    yaku: yaku, naki: naki, riichi: game.riichi.slice(), meCalled: game.meCalled
  });
  game.kyotaku = 0;
  game.honba = dealerWin ? game.honba + 1 : 0;
  closeModal();
  endHand(dealerWin);
}

// 流局の精算：ノーテン罰符 3,000点を聴牌者で分け合う
function settleDraw() {
  const tenpai = modalState.tenpai;
  const n = tenpai.length;
  snapshot();
  let detail = '点数移動なし';
  if (n > 0 && n < 4) {
    const gain = 3000 / n;
    const loss = 3000 / (4 - n);
    players.forEach((k) => { game.scores[k] += tenpai.includes(k) ? gain : -loss; });
    detail = `聴牌者 +${fmt(gain)}点 ／ ノーテン −${fmt(loss)}点`;
  }
  addHistory(`流局：聴牌 ${n ? tenpai.map((k) => nm(k)).join('・') : 'なし'}`, detail,
    { type: 'draw', tenpai: tenpai.slice(), riichi: game.riichi.slice(), meCalled: game.meCalled });
  const dealerStays = tenpai.includes(game.parent);
  // 親が聴牌なら1本積んで連荘、ノーテンで親が流れたら0本に戻す
  game.honba = dealerStays ? game.honba + 1 : 0;
  closeModal();
  endHand(dealerStays);
}

// ===== 牌譜（Supabase） =====
function saveRecord() {
  if (!user || !db || saving || game.saved) return;
  saving = true; saveError = '';
  renderGame();
  const names = {};
  players.forEach((k) => { names[k] = nm(k); });
  db.from('games').insert({ players: names, scores: game.scores, history: game.history, my_seat: game.mySeat || null })
    .then((res) => res.error, (error) => error)
    .then((error) => {
      saving = false;
      if (error) saveError = `保存に失敗しました：${error.message}（もう一度「牌譜を保存」を押してください）`;
      else { game.saved = true; game.undo = []; }
      renderGame();
    });
}

function showRecords() {
  if (!db || !user) return;
  modalState = { mode: 'records' };
  $('modalTitle').textContent = '牌譜';
  $('modalContent').innerHTML = '<p class="modal-intro">読み込み中…</p>';
  $('modalOverlay').classList.remove('hidden');

  db.from('games').select('id, played_at, players, scores, history').order('played_at', { ascending: false }).limit(50)
    .then((res) => res, (error) => ({ error: error }))
    .then((res) => renderRecords(res.data, res.error));
}

function renderRecords(data, error) {
  if (!modalState || modalState.mode !== 'records') return;
  if (error) { $('modalContent').innerHTML = `<p class="modal-intro">読み込みに失敗しました：${esc(error.message)}</p>`; return; }
  if (!data.length) { $('modalContent').innerHTML = '<p class="modal-intro">保存された牌譜はまだありません。</p>'; return; }

  $('modalContent').innerHTML = data.map((g) => {
    const name = (k) => esc((g.players && g.players[k]) || seatLabel[k]);
    const date = new Date(g.played_at).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' });
    return `<details class="record">
      <summary><span class="record-date">${date}</span><span class="record-rank">${ranking(g.scores).map((k, i) => `${i + 1}位 ${name(k)} ${fmt(g.scores[k])}`).join(' ／ ')}</span></summary>
      <div class="record-body">${(g.history || []).length ? historyHtml(g.history) : '<p class="empty-history">履歴なし</p>'}
        <button class="text-button danger" data-action="delete-record" data-id="${esc(g.id)}">この牌譜を削除</button></div>
    </details>`;
  }).join('');
}

function deleteRecord(id) {
  if (!window.confirm('この牌譜を削除しますか？削除すると元に戻せません。')) return;
  db.from('games').delete().eq('id', id)
    .then((res) => res.error, (error) => error)
    .then((error) => {
      if (error) { window.alert(`削除に失敗しました：${error.message}`); return; }
      showRecords();
    });
}

// ===== 成績（自分の席を設定して保存した対局から集計） =====
function computeStats(games) {
  const s = { games: 0, ranks: [0, 0, 0, 0], hands: 0, wins: 0, winPoints: 0, dealIns: 0, calls: 0, riichi: 0 };
  games.forEach((g) => {
    const me = g.my_seat;
    if (!players.includes(me) || !g.scores) return;
    s.games += 1;
    s.ranks[ranking(g.scores).indexOf(me)] += 1;
    (g.history || []).forEach((item) => {
      const h = item.hand;
      if (!h) return;
      s.hands += 1;
      if (h.riichi && h.riichi.includes(me)) s.riichi += 1;
      if (h.meCalled || (h.type === 'win' && h.winner === me && h.naki)) s.calls += 1;
      if (h.type === 'win' && h.winner === me) { s.wins += 1; s.winPoints += h.points; }
      if (h.type === 'win' && h.method === 'ron' && h.loser === me) s.dealIns += 1;
    });
  });
  return s;
}

function statsHtml(s) {
  const pct = (a, b) => (b ? `${(a / b * 100).toFixed(1)}%` : '—');
  const avgRank = s.games ? (s.ranks.reduce((sum, c, i) => sum + c * (i + 1), 0) / s.games).toFixed(2) : '—';
  const items = [
    ['対戦数', `${s.games}戦`], ['平均順位', avgRank],
    ['1位率', pct(s.ranks[0], s.games)], ['2位率', pct(s.ranks[1], s.games)],
    ['3位率', pct(s.ranks[2], s.games)], ['4位率', pct(s.ranks[3], s.games)],
    ['和了率', pct(s.wins, s.hands)], ['放銃率', pct(s.dealIns, s.hands)],
    ['副露率', pct(s.calls, s.hands)], ['立直率', pct(s.riichi, s.hands)],
    ['平均和了点数', s.wins ? `${fmt(Math.round(s.winPoints / s.wins))}点` : '—'], ['総局数', `${s.hands}局`]
  ];
  return `<p class="modal-intro">「自分の席」を設定して保存した対局から集計しています。和了率・放銃率・副露率・立直率は局数あたり、平均和了点数は本場・供託を除いた点数です。</p>
    <div class="stats-grid">${items.map((it) => `<div class="stat"><span>${it[0]}</span><strong>${it[1]}</strong></div>`).join('')}</div>`;
}

function showStats() {
  if (!db || !user) return;
  modalState = { mode: 'stats' };
  $('modalTitle').textContent = '成績';
  $('modalContent').innerHTML = '<p class="modal-intro">集計中…</p>';
  $('modalOverlay').classList.remove('hidden');
  db.from('games').select('my_seat, scores, history').limit(1000)
    .then((res) => res, (error) => ({ error: error }))
    .then((res) => {
      if (!modalState || modalState.mode !== 'stats') return;
      $('modalContent').innerHTML = res.error
        ? `<p class="modal-intro">集計に失敗しました：${esc(res.error.message)}（README の「my_seat 列の追加」を実行したか確認してください）</p>`
        : statsHtml(computeStats(res.data));
    });
}

// ===== イベント =====
$('authForm').addEventListener('submit', submitAuth);
$('guestButton').addEventListener('click', () => { guest = true; route(); });
$('logoutButton').addEventListener('click', () => {
  const done = () => { user = null; guest = false; route(); };
  if (user && db) db.auth.signOut().then(done, done);
  else done();
});
$('recordsButton').addEventListener('click', showRecords);
$('statsButton').addEventListener('click', showStats);
$('callButton').addEventListener('click', () => {
  if (game.finished || !game.mySeat) return;
  game.meCalled = !game.meCalled;
  renderGame();
});
$('setupForm').addEventListener('submit', (event) => {
  event.preventDefault();
  players.forEach((k) => { game.names[k] = $(`name${cap(k)}`).value.trim(); });
  game.mySeat = players.filter((k) => $(`me${cap(k)}`).checked)[0] || '';
  game.started = true;
  route();
});
$('winButton').addEventListener('click', () => openModal({ mode: 'win', step: 'winner', winner: null, method: null, loser: null, score: null, yaku: null, naki: null }));
$('riichiButton').addEventListener('click', () => openModal({ mode: 'riichi' }));
$('drawButton').addEventListener('click', () => openModal({ mode: 'draw', tenpai: game.riichi.slice() }));
$('undoButton').addEventListener('click', undoLast);
$('resetButton').addEventListener('click', () => {
  if (game.finished || window.confirm('現在の対局を破棄して、プレイヤー設定に戻りますか？')) goSetup();
});
$('newGameButton').addEventListener('click', goSetup);
$('saveButton').addEventListener('click', saveRecord);
$('closeModalButton').addEventListener('click', closeModal);
$('modalOverlay').addEventListener('click', (event) => { if (event.target === $('modalOverlay')) closeModal(); });
$('modalContent').addEventListener('click', handleModalClick);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modalState) closeModal(); });

if (db) {
  db.auth.getSession().then((res) => { setUser(res.data.session); route(); }, () => route());
} else {
  $('authNote').textContent = 'Supabase が未設定のため、ログインせずに使うことのみできます（牌譜は保存されません）。';
  route();
}
