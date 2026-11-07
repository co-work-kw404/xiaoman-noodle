const $ = (id) => document.getElementById(id);
const titles = {
  book: "廚藝書",
  computer: "學習電腦",
  video: "料理示範動畫",
  sim: "免費料理模擬器",
  stove: "料理爐台",
  counter: "餐廳櫃台",
  help: "遊戲指南",
  journal: "學習圖鑑",
  result: "出餐評價",
  achievements: "成就收藏",
};
const labels = { prep: "開業前籌備", open: "營業中", closed: "已打烊" };
const time = (n) => Math.max(0, Math.ceil(n)) + " 秒";
let page = "",
  message = "",
  key = "",
  cookKey = "";
let stopKitchen = () => {};
function button(label, handler, primary = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "action" + (primary ? " primary" : "");
  b.textContent = label;
  b.onclick = handler;
  return b;
}
function action(a, v) {
  message = Game.act(a, v);
  $("feedback").textContent = message;
  key = "";
  draw();
  return message;
}
function station(name) {
  if (["book", "computer", "sim", "video"].includes(name) && !Game.canLearn()) {
    action("learn", "book");
    return;
  }
  stopKitchen();
  page = name;
  cookKey = "";
  $("modalTitle").textContent = titles[name];
  const body = $("body");
  body.replaceChildren();
  if (!$("modal").open) $("modal").showModal();
  if (["book", "sim", "video"].includes(name)) {
    action("learn", name);
    showLesson(name, body);
  } else if (name === "computer") {
    body.append(
      button("播放料理示範動畫", () => station("video"), true),
      button("開啟免費模擬器", () => station("sim")),
    );
  } else if (name === "help") {
    body.innerHTML =
      "<p>開店前先熟悉店裡的設施。點地圖上的設施或下方按鈕前往，也可在地圖上用方向鍵移動、Enter 互動。</p><ol><li>翻廚藝書、看示範、用模擬器測試。模擬器完全免費，爐台試作會扣食材費，開火累積的燃料費在起鍋時結算。</li><li>到櫃台掛牌營業，接單後到爐台加水、開火、下麵、試吃，再起鍋。手上有工作時，學習資源會暫停開放。</li><li>用收入升級廚具、挑戰新餐點。打烊後不收新單，可完成手上的工作。超過休息額度會縮短下一次營業時間。</li></ol><p>遊戲在分頁顯示時推進，進度會儲存在這個瀏覽器。</p>";
  } else if (name === "journal") {
    body.innerHTML =
      "<p>這些條目記錄你接觸過的資源。頁碼對應《人力績效》第十章。</p>" +
      [
        [
          "book",
          "廚藝書",
          "自行選材、掌握閱讀步調，可支援 Self-Directed Learning（p. 261）。",
        ],
        ["video", "料理示範動畫", "觀察示範是玩家的活動；影像是傳遞媒介（p. 269）。"],
        [
          "sim",
          "電腦模擬器",
          "改變模型條件並觀察結果，對應 Simulations（pp. 273–274）。",
        ],
      ]
        .map(
          ([k, n, d]) =>
            "<p><b>" +
            n +
            " · " +
            (Game.s.learned[k] ? "已開啟" : "尚未開啟") +
            "</b><br>" +
            d +
            "</p>",
        )
        .join("") +
      "<p><b>即時料理挑戰</b><br>在虛擬廚房完成整份訂單，也屬於模擬。遊戲分數記錄本次模型內的表現。</p>";
  } else if (name === "achievements") {
    body.innerHTML = "<p>達成條件就會解鎖。成就與進度一同儲存在目前瀏覽器。</p>";
    for (const [id, title, description] of Game.achievementDefinitions) {
      const card = document.createElement("article");
      card.className = "achievement" + (Game.s.achievements[id] ? " unlocked" : "");
      const heading = document.createElement("h3");
      heading.textContent = Game.s.achievements[id] ? "★ " + title : "☆ ???";
      const detail = document.createElement("p");
      detail.textContent = description;
      detail.hidden = !Game.s.achievements[id];
      const status = document.createElement("small");
      status.textContent = Game.s.achievements[id] ? "已解鎖" : "未解鎖";
      card.append(heading, detail, status);
      body.append(card);
    }
    const note = document.createElement("p");
    note.textContent =
      "舊進度可確認的首次料理與廚具升級會自動補發；連續高分與試驗紀錄從本版開始累積。";
    body.append(note);
  } else if (name === "result") {
    const r = Game.s.last;
    body.innerHTML =
      '<p class="notice">' +
      (r.trial
        ? "媽媽的試作評語"
        : Game.s.level
          ? "廚師長的出餐評語"
          : "媽媽的出餐評語") +
      "</p><h2>" +
      r.score +
      ' 分</h2><p id="review"></p><div id="receipt"></div>';
    $("review").textContent = r.comment;
    const rows = [
      ["料理時間", (r.elapsed || 0).toFixed(1) + " 秒"],
      ["蒸發水量", (r.evaporated || 0).toFixed(1) + " mL"],
      ["餐點收入", "＄" + (r.gross ?? r.pay).toFixed(2)],
      ["食材成本（領料時扣款）", "＄" + (r.ingredients || 0).toFixed(2)],
      ["燃料費（本次結算）", "＄" + (r.fuel || 0).toFixed(2)],
      ["本次損益", "＄" + (r.profit ?? r.pay).toFixed(2)],
    ];
    for (const [label, value] of rows) {
      const line = document.createElement("p");
      line.className = "receiptline";
      line.textContent = label + "　" + value;
      $("receipt").append(line);
    }
    body.append(button("收下評語", () => $("modal").close(), true));
  } else refreshPanel(true);
}
function desk(container) {
  const s = Game.s,
    add = (l, f, p) => container.append(button(l, f, p));
  if (s.pot) add("回到料理爐台", () => station("stove"), true);
  if (s.phase === "open") {
    if (!s.pot) {
      for (const [id, label] of [
        ["basic", "接單・招牌麵"],
        ...(s.level >= 1 ? [["advanced", "接單・進階餐點"]] : []),
      ])
        add(
          label,
          () => {
            action("order", id);
            if (Game.s.pot) station("stove");
            else station("counter");
          },
          id === "basic",
        );
    }
    add("掛牌打烊", () => {
      action("close");
      if (page === "counter") station("counter");
    });
  } else if (!s.pot) {
    add(
      s.phase === "prep" ? "掛牌開始營業" : "開始下一個營業日",
      () => {
        action("open");
        if (page === "counter") station("counter");
      },
      !s.pot,
    );
  }
}
function refreshPanel(force = false) {
  const s = Game.s,
    body = $("body");
  if (page === "counter" && force) {
    body.innerHTML =
      "<p>店內資金 <b>＄" + s.money + "</b>　廚具等級 <b>" + s.level + "</b></p>";
    desk(body);
    if (s.level < 2)
      body.append(
        button("升級廚具 · ＄" + Game.upgradeCost(), () => {
          action("upgrade");
          station("counter");
        }),
      );
    body.append(document.createElement("p"));
    body.lastChild.textContent = message;
    return;
  }
  if (page !== "stove") return;
  if (!s.pot) {
    if (force) {
      body.innerHTML =
        "<p>試作會使用食材與燃料，完成後會結算燃料費並提供評語。若要賺取收入，請在營業時到櫃台接單。</p>";
      if (s.phase !== "open")
        body.append(
          button(
            "領取食材試作 · ＄12",
            () => {
              action("trial");
              station("stove");
            },
            true,
          ),
        );
      body.append(button("前往櫃台", () => station("counter")));
      const p = document.createElement("p");
      p.textContent = message;
      body.append(p);
    }
    return;
  }
  const p = s.pot;
  if (force || cookKey !== "cooking") {
    cookKey = "cooking";
    body.innerHTML =
      '<canvas id="liveKitchen" width="520" height="240" role="img"></canvas><p id="kitchenStatus"></p><h3 id="dish"></h3><div class="stats"><b id="water"></b><b id="temp"></b><b id="heat"></b><b id="fuel"></b><b id="elapsed"></b></div><p id="noodlestate"></p><div class="cookgrid" id="controls"></div><p class="notice" id="potmsg" role="status"></p>';
    const op = (a, v) => {
      action(a, v);
      if (!Game.s.pot && a === "lift") station("result");
      else if ($("potmsg")) $("potmsg").textContent = message;
    };
    for (const [l, a, v] of [
      ["補水 100 mL", "water"],
      ["下麵", "noodle"],
      ["關火", "heat", 0],
      ["小火", "heat", 1],
      ["中火", "heat", 2],
      ["大火", "heat", 3],
      ["試吃口感", "taste"],
      ["起鍋送評", "lift"],
    ])
      $("controls").append(button(l, () => op(a, v), a === "lift"));
    $("potmsg").textContent = message;
    stopKitchen();
    stopKitchen = startKitchenAnimation(
      $("liveKitchen"),
      $("kitchenStatus"),
      () => Game.s.pot,
    );
  }
  $("fuel").textContent = "燃料費 ＄" + (p.fuel || 0).toFixed(2);
  $("elapsed").textContent = "經過 " + (p.elapsed || 0).toFixed(1) + " 秒";
  $("dish").textContent = (p.trial ? "試作" : "訂單") + " · " + p.name;
  $("water").textContent = Math.round(p.water) + " mL";
  $("temp").textContent = Math.round(p.temp) + " °C";
  $("heat").textContent = ["關火", "小火", "中火", "大火"][p.heat];
  $("noodlestate").textContent = p.noodle
    ? "麵已下鍋，可試吃判斷起鍋時機。"
    : "觀察水溫，決定下麵時機。";
}
let toastUntil = 0;
function showAchievementsNotice() {
  const toast = $("achievementToast");
  const parent = $("modal").open ? $("modal") : document.body;
  if (toast.parentElement !== parent) parent.append(toast);
  const count = Object.keys(Game.s.achievements).length;
  $("achievements").textContent =
    "成就收藏 · " + count + "／" + Game.achievementDefinitions.length;
  if (Game.notices.length) {
    const names = Game.notices.splice(0);
    $("achievementToast").textContent = "★ 成就解鎖　" + names.join("、");
    $("achievementToast").hidden = false;
    toastUntil = Date.now() + 7000;
  } else if (Date.now() > toastUntil) $("achievementToast").hidden = true;
}
function draw() {
  showAchievementsNotice();
  const s = Game.s;
  $("phase").textContent = labels[s.phase];
  $("money").textContent = s.money.toFixed(2);
  $("day").textContent = String(s.day).padStart(2, "0");
  $("path").textContent = Game.path();
  const shift =
    s.phase === "open"
      ? '剩餘營業時間 <b class="clock">' + time(s.remaining) + "</b>"
      : s.phase === "closed"
        ? "休息額度 45 秒 · 已打烊 <b>" +
          time(s.closedFor) +
          "</b><br>下次可營業 " +
          time(Game.nextDuration())
        : "尚未掛牌。先免費試驗，或花食材費到爐台練習。";
  $("shift").innerHTML = "<p>" + shift + "</p>";
  const next = [s.phase, !!s.pot, s.level, s.day].join("|");
  if (next !== key) {
    key = next;
    $("actions").replaceChildren();
    desk($("actions"));
    if (page === "counter") refreshPanel(true);
  }
  if (page === "stove") refreshPanel();
}
$("modal").addEventListener("close", () => {
  stopKitchen();
  page = "";
  $("body").replaceChildren();
});
$("dismiss").onclick = () => $("modal").close();
$("help").onclick = () => station("help");
$("journal").onclick = () => station("journal");
$("achievements").onclick = () => station("achievements");
for (const id of ["book", "computer", "stove", "counter"]) {
  const b = button(titles[id], () => station(id));
  b.className = "";
  $("stations").append(b);
}
initScene($("scene"), station);
draw();
let prior = performance.now();
document.addEventListener("visibilitychange", () => {
  prior = performance.now();
});
setInterval(() => {
  const now = performance.now(),
    elapsed = (now - prior) / 1000;
  prior = now;
  if (document.hidden) return;
  const previous = Game.s.phase;
  Game.tick(Math.min(elapsed, 2));
  if (previous !== Game.s.phase) {
    message = Game.hint;
    $("feedback").textContent = message;
  }
  draw();
}, 250);
