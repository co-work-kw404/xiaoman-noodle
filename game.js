/* Restaurant rules shared by the interactive kitchen and the free simulator. */
(() => {
  'use strict';
  const SHIFT = 120;
  const BREAK = 45;
  const SLOT = 'noodle-restaurant-state-v1';
  const newState = () => ({
    phase: 'prep', money: 180, day: 0, remaining: 0, closedFor: 0,
    level: 0, served: 0, trials: 0, pot: null, last: null,
    learned: { book: false, video: false, sim: false },
    achievements: {}, experiments: [], streak: 0
  });

  // Temperature drives cooking. Excess energy at boiling drives evaporation.
  const POWER = [0, 1400, 2800, 5600];
  const FUEL_RATE = [0, 0.04, 0.09, 0.20];
  function cookStep(p, seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return p;
    p.elapsed ??= 0;
    p.fuel ??= 0;
    p.evaporated ??= 0;
    let left = seconds;
    while (left > 0) {
      const dt = Math.min(0.25, left);
      p.elapsed += dt;
      if (p.water > 0) {
        p.fuel += FUEL_RATE[p.heat] * dt;
        const capacity = Math.max(120, p.water + (p.noodle ? 100 : 0));
        const netEnergy = POWER[p.heat] - 10 * (p.temp - 24);
        const predicted = p.temp + netEnergy * dt / capacity;
        const evaporation = Math.max(0, predicted - 100) * capacity / 2260;
        p.temp = Math.max(24, Math.min(100, predicted));
        p.water = Math.max(0, p.water - evaporation);
        p.evaporated += evaporation;
        if (p.noodle) p.done += Math.max(0, p.temp - 65) / 35 * dt;
      }
      left -= dt;
    }
    return p;
  }
  function addNoodles(p) {
    if (p.noodle || p.water <= 0) return;
    p.temp = (p.temp * p.water + 24 * 100) / (p.water + 100);
    p.noodle = true;
  }
  const roundMoney = amount => Math.round(amount * 100) / 100;

  let s = newState();
  try {
    const data = JSON.parse(localStorage.getItem(SLOT) || 'null');
    if (data && data.v === 1 && ['prep', 'open', 'closed'].includes(data.s.phase)) {
      s = Object.assign(newState(), data.s);
    }
  } catch { /* Private browsing and blocked storage still allow a full session. */ }
  // Backfill only milestones supported by the existing save.
  s.achievements = s.achievements || {};
  s.experiments = s.experiments || [];
  s.streak = s.streak || 0;
  const notices = [];
  const achievementDefinitions = [
    ['first', '第一次下廚', '完成一份料理或試作，不限評分。'],
    ['disaster', '廚房災難', '經歷一次燒乾，起鍋並讀取評語。'],
    ['experiment', '實驗精神', '模擬三組不同條件，得到至少三種口感結果。'],
    ['master', '料理大師', '連續完成三份 90 分以上料理，試作也計入。'],
    ['scholar', '勤學不倦', '開啟三種學習資源後，再完成一份料理。'],
    ['upgrade', '工欲善其事', '第一次升級廚具。'],
    ['advanced', '細麵達人', '完成一份 90 分以上的進階細麵。']
  ];
  function unlock(id, announce = true) {
    if (s.achievements[id]) return;
    s.achievements[id] = true;
    if (announce) notices.push(achievementDefinitions.find(item => item[0] === id)[1]);
  }
  if (s.served + s.trials > 0) unlock('first', false);
  if (s.level > 0) unlock('upgrade', false);
  if (s.last?.comment?.includes('水燒乾')) unlock('disaster', false);
  function recordExperiment(config, texture) {
    if (!canLearn()) return;
    const key = JSON.stringify(config);
    if (!s.experiments.some(item => item.key === key)) s.experiments.push({key, texture});
    if (s.experiments.length >= 3 && new Set(s.experiments.map(item => item.texture)).size >= 3) unlock('experiment');
    save();
  }
  function save() {
    try { localStorage.setItem(SLOT, JSON.stringify({ v: 1, s })); } catch { /* Optional persistence. */ }
  }
  const nextDuration = () => Math.max(0, SHIFT - Math.max(0, s.closedFor - BREAK));
  const upgradeCost = () => [80, 140, 0][s.level];
  const canLearn = () => !s.pot;
  function startPot(trial, advanced) {
    if (s.pot) return '先完成手上的料理。';
    if (!trial && s.phase !== 'open') return '營業時才能接單。';
    if (advanced && s.level < 1) return '升級廚具後解鎖進階麵。';
    const cost = advanced ? 22 : 12;
    if (trial && s.money < cost) return '試作食材費不足。可以開始營業，或使用免費模擬器。';
    // A customer deposit covers only missing ingredients and is deducted at checkout.
    const deposit = Math.max(0, cost - s.money);
    s.money += deposit - cost;
    s.pot = {
      trial, advanced, cost, deposit, name: advanced ? '細麵・偏硬' : '招牌湯麵',
      target: advanced ? 6 : 8, water: 400, temp: 24, heat: 0, noodle: false, done: 0, elapsed: 0, fuel: 0, evaporated: 0
    };
    if (deposit) return '已接單，顧客預付食材費差額 $' + deposit + '，交餐時抵扣。';
    return (trial ? '已開始試作' : '已接單') + '，食材費 $' + cost + '。先加熱鍋中的水。';
  }
  function taste(p) {
    if (p.water <= 0) return '鍋已燒乾，請起鍋結束這次料理。';
    if (!p.noodle) return '鍋裡還沒有麵。';
    if (p.done < 4) return '麵心仍生硬，咬開有明顯粉感。';
    if (p.done < 7) return '麵心結實，咬起來偏硬。';
    if (p.done < 9.5) return '麵條有彈性，麵心熟透，軟硬適中。';
    if (p.done < 12) return '麵條偏軟，咬下時幾乎沒有阻力。';
    return '麵條過軟，夾起來容易斷。';
  }
  function serve(p) {
    const dry = p.water <= 0;
    const diff = Math.abs(p.done - p.target);
    const tolerance = (p.advanced ? 0.6 : 0.9) + s.level * 0.4;
    const score = dry || !p.noodle ? 0 : Math.max(0, Math.round(100 - Math.max(0, diff - tolerance) * 10 - Math.max(0, 110 - p.water) * 0.15));
    const gross = score && !p.trial ? Math.round((p.advanced ? 74 : 45) * score / 100) : 0;
    const fuel = roundMoney(p.fuel || 0);
    const pay = gross - p.deposit;
    s.money = roundMoney(s.money + pay - fuel);
    const comment = dry ? '水燒乾了。下次觀察水量，及時補水。' :
      !p.noodle ? '碗裡少了麵。下次記得下麵後再試吃。' :
      p.water < 110 ? '湯量偏少。下次起鍋前留意水量。' :
      score >= 90 ? '口感符合這碗麵的要求，起鍋時機抓得很好。' :
      p.done < p.target ? '麵心比目標硬，下次再煮一會兒。' : '口感比目標軟，下次可以提早起鍋。';
    s.last = {
      name: p.name, trial: p.trial, score, pay, gross, comment, fuel,
      ingredients: p.cost, profit: roundMoney(gross - p.cost - fuel),
      elapsed: p.elapsed || 0, water: p.water, evaporated: p.evaporated || 0
    };
    unlock('first');
    if (dry) unlock('disaster');
    s.streak = score >= 90 ? s.streak + 1 : 0;
    if (s.streak >= 3) unlock('master');
    if (Object.values(s.learned).every(Boolean)) unlock('scholar');
    if (p.advanced && score >= 90) unlock('advanced');
    if (p.trial) s.trials++; else s.served++;
    s.pot = null;
    return '料理完成。' + comment;
  }
  function path() {
    if (!s.learned.book) return '可先讀廚藝書，認識下麵與起鍋的順序。';
    if (!s.learned.video) return '可看示範，留意沸騰時鍋面的變化。';
    if (!s.learned.sim) return '可用免費模擬器比較火力與時間。';
    if (s.last && s.last.score < 80) return '可回模擬器重新試驗，再依試吃結果調整起鍋時機。';
    if (!s.served) return '準備好便開始營業，試著完成第一張訂單。';
    if (!s.level) return '累積 $80，可升級廚具並解鎖進階麵。';
    return '可挑戰偏硬的細麵，提前試吃，觀察麵心。';
  }
  function act(action, value) {
    const p = s.pot;
    switch (action) {
      case 'open': {
        if (s.phase === 'open') return '已經營業中。';
        if (p) return '先完成手上的料理，再開始營業。';
        const time = nextDuration();
        s.day++; s.closedFor = 0;
        if (time <= 0) { s.phase = 'closed'; s.remaining = 0; return '超時已抵完本日營業時間。新打烊時段開始，可立即開啟下一營業日。'; }
        s.phase = 'open'; s.remaining = time;
        return '第 ' + s.day + ' 天開始營業，可到櫃台接單。';
      }
      case 'close':
        if (s.phase !== 'open') return '目前沒有營業。';
        s.phase = 'closed'; s.closedFor = 0; s.remaining = 0;
        return p ? '已停止接單，請完成手上這一鍋。' : '已打烊，可休息或學習。';
      case 'order': return startPot(false, value === 'advanced');
      case 'trial': return startPot(true, value === 'advanced');
      case 'learn':
        if (p) return '手上有料理，請完成後再學習。';
        if (!Object.hasOwn(s.learned, value)) return '無此學習資源。';
        s.learned[value] = true; return '已開啟學習資源。';
      case 'upgrade': {
        if (p) return '請先完成料理再升級。';
        if (s.level >= 2) return '廚具已達最高等級。';
        const cost = upgradeCost();
        if (s.money < cost) return '升級需要 $' + cost + '，目前資金不足。';
        s.money = roundMoney(s.money - cost); s.level++;
        unlock('upgrade');
        return s.level === 1 ? '廚具已升級，起鍋容許範圍增加，進階細麵已解鎖。' : '頂級廚具已就緒，起鍋容許範圍再次增加。';
      }
      case 'heat':
        if (!p || ![0,1,2,3].includes(Number(value))) return '先開始料理並選擇火力。';
        p.heat = Number(value); return '火力調為 ' + p.heat + '。';
      case 'water': {
        if (!p) return '先開始料理。';
        if (p.water <= 0) return '鍋已燒乾，請先起鍋。';
        const add = Math.min(100, 1000 - p.water);
        p.temp = (p.temp * p.water + 24 * add) / (p.water + add);
        p.water += add; return add > 0 ? '已加入常溫水。' : '水量已滿。';
      }
      case 'noodle':
        if (!p) return '先開始料理。';
        if (p.water <= 0) return '鍋已燒乾，請先起鍋。';
        if (p.noodle) return '麵已在鍋中。';
        addNoodles(p); return '已下麵，水溫暫時下降。觀察回溫並試吃。';
      case 'taste': return p ? taste(p) : '先開始料理。';
      case 'lift': return p ? serve(p) : '目前沒有料理。';
      default: return '找不到這個操作。';
    }
  }
  let elapsedSave = 0;
  const api = {
    s, hint: '', canLearn, nextDuration, upgradeCost, path,
    achievementDefinitions, notices, recordExperiment,
    act(action, value) { api.hint = act(action, value); save(); return api.hint; },
    tick(seconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      if (s.pot) cookStep(s.pot, seconds);
      if (s.phase === 'closed') s.closedFor += seconds;
      if (s.phase === 'open') {
        s.remaining -= seconds;
        if (s.remaining <= 0) {
          s.closedFor = -s.remaining; s.remaining = 0; s.phase = 'closed';
          api.hint = s.pot ? '時間到，已停止接單。請完成手上的料理。' : '本日營業結束，已打烊。';
        }
      }
      elapsedSave += seconds;
      if (elapsedSave >= 1) { save(); elapsedSave = 0; }
    }
  };
  globalThis.cookStep = cookStep;
  globalThis.addNoodles = addNoodles;
  globalThis.Game = api;
})();
