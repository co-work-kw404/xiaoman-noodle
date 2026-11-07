(() => {
  const styles = `
  .learn{color:#243c32;line-height:1.65;font-family:inherit;--leaf:#285444;--cream:#fff9e8}
  .learn *{box-sizing:border-box}.learn h3,.learn p{margin:0 0 .6em}.learn .kicker{font-size:.77rem;color:#79512f;font-weight:800;letter-spacing:.1em}
  .learn .paper,.learn .screen{border:1px solid #b9b6a1;border-radius:12px;padding:clamp(12px,3vw,22px);background:var(--cream)}
  .learn .paper{border-left:7px solid #bc6741}.learn .steps{padding-left:1.6em;margin:.6em 0}.learn .steps li{padding:4px 0}
  .learn .tip{border-top:1px dashed #b8aa8c;padding-top:8px;margin:8px 0 0}
  .learn .pan{width:100%;height:clamp(105px,18vh,165px);display:block;background:#253e35;border-radius:8px}
  .learn .slider{width:100%;display:block;accent-color:#34725b;margin:5px 0 10px}.learn .line{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .learn button{padding:7px 13px;min-height:36px;border:1px solid #8a987e;border-radius:7px;background:#fffbed;color:#294e40;font:inherit;font-weight:bold;cursor:pointer}
  .learn button.main{background:#335f4c;color:#fffbed}.learn label{display:block;font-weight:650}.learn .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
  .learn select{width:100%;font:inherit;color:#293d32;padding:5px;background:#fffaf0;border:1px solid #a5a58f;border-radius:5px}
  .learn table{width:100%;border-collapse:collapse;font-size:.88em;margin-top:.6em}.learn td,.learn th{padding:5px 3px;text-align:left;border-bottom:1px solid #c3c1ac}.learn [role=status]{margin:.5em 0 0}
  `;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function book(root) {
    root.innerHTML = `<article class="paper"><p class="kicker">廚藝書 ／ 基礎篇</p><h3>煮麵的三個判斷</h3><ol class="steps">
    <li><b>看水，再下麵。</b> 加水開火，觀察水溫。大量氣泡持續上升，是水接近沸騰的線索。</li>
    <li><b>看水量，調火力。</b> 大火升溫快，耗水與燃料費也較高。下麵和補水會降低水溫，請觀察恢復沸騰的速度。</li>
    <li><b>試吃，再起鍋。</b> 麵芯偏硬可以再等一會兒；達到客人要的口感就起鍋，繼續煮會更軟。</li></ol>
    <p class="tip"><b>下一次練習</b>　選同一份水量與火力，只改變起鍋時間，比較兩次的口感。</p></article>`;
  }
  const stages = [
    ["觀察鍋中的水", "開火後觀察水面。剛加熱時，氣泡稀少。"],
    ["水滾，下麵", "氣泡持續冒出時下麵，然後觀察水量與麵條的變化。"],
    ["試吃，決定起鍋", "以試吃得到的口感和訂單要求比較，再決定要繼續煮或起鍋。"],
  ];
  function demo(root) {
    root.innerHTML = `<section class="screen"><p class="kicker">料理示範 ／ 12 秒動畫</p><h3 data-title></h3>
    <svg aria-hidden="true" viewBox="0 0 320 135" class="pan"><path d="M0 108H320" stroke="#69806a" stroke-width="2"/>
    <g fill="#e9a750"><path d="m133 107 6-13 5 13m7 0 8-17 6 17m8 0 8-15 5 15"/></g>
    <g fill="#b45837" stroke="#efaf70" stroke-width="2"><path d="M102 63h116l-8 36q-49 16-100 0z"/><path d="M105 69H87v6h20m108-6h18v6h-20"/></g>
    <ellipse cx="160" cy="63" rx="58" ry="12" fill="#f0c88b"/><ellipse cx="160" cy="63" rx="52" ry="8" fill="#70b9b0"/>
    <g data-noodles stroke="#ffdb78" fill="none" stroke-width="2.6"><path d="M129 64q10-8 20 0t22 0 22 0m-52-3q10-8 20 0t22 0"/></g>
    <g data-bubbles fill="none" stroke="#e7ffeb" stroke-width="1.5"></g><g data-sticks stroke="#f2c18d" stroke-width="3"><path d="m165 58 63-45m-58 47 66-40"/></g>
    </svg><p data-caption></p><label>播放進度 <span data-time></span><input class="slider" type="range" min="0" max="12" step=".1" value="0"></label>
    <div class="line"><button type="button" class="main" data-play>播放示範</button><button type="button" data-restart>從頭播放</button></div></section>`;
    const get = (name) => root.querySelector("[data-" + name + "]");
    const slider = root.querySelector("input"),
      play = get("play");
    const bubbles = Array.from({ length: 13 }, (_, i) => {
      const e = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      e.setAttribute("cx", 116 + ((i * 23) % 87));
      get("bubbles").append(e);
      return e;
    });
    let time = 0,
      running = false,
      previous = 0,
      frame = 0;
    function render() {
      const stage = Math.min(2, Math.floor(time / 4));
      get("title").textContent = stages[stage][0];
      get("caption").textContent = stages[stage][1];
      get("time").textContent = Math.floor(time) + " / 12 秒";
      slider.value = time;
      get("noodles").style.opacity = stage > 0 ? "1" : "0";
      get("sticks").style.opacity = stage > 0 ? "1" : "0";
      if (stage === 1)
        get("sticks").setAttribute(
          "transform",
          "translate(0 " + Math.sin(time * 2) * 5 + ")",
        );
      bubbles.forEach((b, i) => {
        const cycle = (time * (stage === 0 ? 0.45 : 1.3) + i * 0.19) % 1;
        b.setAttribute("cy", 64 - cycle * 17);
        b.setAttribute("r", 1 + cycle * 2.5);
        b.style.opacity = i > 2 && stage === 0 ? "0" : String(1 - cycle);
      });
      play.textContent = running ? "暫停" : time >= 12 ? "重播示範" : "播放示範";
    }
    function tick(now) {
      if (!running || !root.isConnected || !root.contains(play)) return;
      time = clamp(time + (now - previous) / 1000, 0, 12);
      previous = now;
      if (time >= 12) running = false;
      render();
      if (running) frame = requestAnimationFrame(tick);
    }
    function start() {
      cancelAnimationFrame(frame);
      previous = performance.now();
      running = true;
      render();
      frame = requestAnimationFrame(tick);
    }
    play.onclick = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(frame);
        render();
      } else {
        if (time >= 12) time = 0;
        start();
      }
    };
    get("restart").onclick = () => {
      time = 0;
      start();
    };
    slider.oninput = () => {
      time = Number(slider.value);
      previous = performance.now();
      render();
    };
    render();
  }
  function simulator(root) {
    root.innerHTML = `<section class="screen"><p class="kicker">電腦模擬器 ／ 免費試驗</p>
    <h3>比較火力、時間與成本</h3>
    <p>選擇從冷水開始，或比較沸水下麵後的回溫。同一份口感也可以有不同的時間與燃料成本。所有費用都是預估，試驗不扣錢。</p>
    <div class="form">
      <label>開始條件<select name="start"><option value="cold">冷水加熱，沸騰後自動下麵</option><option value="boiling">沸水立即下麵</option></select></label>
      <label>起始水量<select name="water"><option selected>400</option><option>600</option><option>800</option></select>mL</label>
      <label>火力<select name="heat"><option value="1">小火</option><option value="2" selected>中火</option><option value="3">大火</option></select></label>
      <label>總試驗時間<select name="time"><option>8</option><option>16</option><option selected>24</option><option>40</option><option>60</option><option>90</option></select>秒</label>
    </div><button class="main" type="button">執行試驗</button><p role="status"></p>
    <div style="overflow-x:auto"><table hidden><thead><tr><th>條件</th><th>時間／下麵</th><th>溫度／剩水</th><th>口感／燃料費</th></tr></thead><tbody></tbody></table></div>
    <p>保留最近五次比較。時間為遊戲加速時間。</p></section>`;
    const body = root.querySelector("tbody");
    root.querySelector("button").onclick = () => {
      if (!Game.canLearn()) return;
      const value = (name) => root.querySelector("[name=" + name + "]").value;
      const water = Number(value("water")),
        heat = Number(value("heat"));
      const seconds = Number(value("time")),
        start = value("start");
      const pot = {
        water,
        temp: start === "cold" ? 24 : 100,
        heat,
        noodle: false,
        done: 0,
      };
      let noodleAt = null;
      if (start === "boiling") {
        addNoodles(pot);
        noodleAt = 0;
      }
      for (let elapsed = 0; elapsed < seconds; elapsed += 0.25) {
        cookStep(pot, 0.25);
        if (!pot.noodle && pot.temp >= 100) {
          addNoodles(pot);
          noodleAt = elapsed + 0.25;
        }
      }
      const texture =
        pot.water <= 0
          ? "燒乾"
          : !pot.noodle
            ? "尚未下麵"
            : pot.done < 4
              ? "生硬"
              : pot.done < 7
                ? "偏硬"
                : pot.done < 9.5
                  ? "適中"
                  : pot.done < 12
                    ? "偏軟"
                    : "過軟";
      const row = document.createElement("tr");
      const cells = [
        (start === "cold" ? "冷水" : "沸水") +
          "／" +
          water +
          "mL／" +
          ["關火", "小火", "中火", "大火"][heat],
        seconds +
          "秒／" +
          (noodleAt === null ? "未下麵" : noodleAt.toFixed(1) + "秒下麵"),
        pot.temp.toFixed(1) + "°C／" + Math.round(pot.water) + "mL",
        texture + "／＄" + pot.fuel.toFixed(2),
      ];
      cells.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      body.prepend(row);
      while (body.children.length > 5) body.lastChild.remove();
      root.querySelector("table").hidden = false;
      root.querySelector("[role=status]").textContent =
        "試驗完成。" +
        texture +
        "，預估燃料費 ＄" +
        pot.fuel.toFixed(2) +
        "（本次不扣款）。";
      if (pot.noodle) Game.recordExperiment({ start, water, heat, seconds }, texture);
    };
  }

  window.showLesson = function (kind, container) {
    const area = document.createElement("div");
    area.className = "learn";
    const style = document.createElement("style");
    style.textContent = styles;
    container.replaceChildren(style, area);
    (({ book, video: demo, sim: simulator })[kind] || book)(area);
  };
})();
