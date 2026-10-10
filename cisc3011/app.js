/* CISC3011 溫習站 — 共用互動 */

/* ---- 1. 進度勾選（存在瀏覽器本機） ---- */
(function () {
  var boxes = document.querySelectorAll('.chk input[type=checkbox][data-k]');
  boxes.forEach(function (b) {
    var k = 'cisc3011:' + b.dataset.k;
    try { if (localStorage.getItem(k) === '1') b.checked = true; } catch (e) {}
    b.addEventListener('change', function () {
      try { localStorage.setItem(k, b.checked ? '1' : '0'); } catch (e) {}
    });
  });
})();

/* ---- 2. 測驗引擎 ---- */
/* 用法：<div class="q" data-ans="2"> 內含 .opt（按順序 0,1,2...）與 .exp */
(function () {
  var qs = document.querySelectorAll('.q[data-ans]');
  if (!qs.length) return;
  var total = qs.length, done = 0, right = 0;

  var bar = document.getElementById('score');

  function refresh() {
    if (!bar) return;
    bar.textContent = '已答 ' + done + ' / ' + total + '　答對 ' + right +
      (done === total ? '　🎉 全部完成！' : '');
  }

  qs.forEach(function (q) {
    var ans = parseInt(q.dataset.ans, 10);
    var opts = q.querySelectorAll('.opt');
    var exp = q.querySelector('.exp');
    var locked = false;
    opts.forEach(function (o, i) {
      o.addEventListener('click', function () {
        if (locked) return;
        locked = true;
        done++;
        if (i === ans) { right++; o.classList.add('right'); }
        else { o.classList.add('wrong'); opts[ans].classList.add('right'); }
        if (exp) exp.classList.add('show');
        refresh();
      });
    });
  });
  refresh();
})();

/* ---- 2b. 多選題引擎（模擬 Part A：全對才給分） ---- */
/* 用法：<div class="mq" data-ans="0,2"> 內含 .opt 與 .exp，另有一顆 .mcheck 按鈕 */
(function () {
  var qs = document.querySelectorAll('.mq[data-ans]');
  if (!qs.length) return;
  var total = qs.length, done = 0, full = 0;
  var bar = document.getElementById('score');

  function refresh() {
    if (!bar) return;
    bar.textContent = '已作答 ' + done + ' / ' + total +
      '　完全答對 ' + full + '（' + (full * 5) + ' 分 / ' + (total * 5) + ' 分）' +
      (done === total ? '　🎉 完成' : '');
  }

  qs.forEach(function (q) {
    var ans = q.dataset.ans.split(',').map(function (x) { return parseInt(x, 10); });
    var opts = Array.prototype.slice.call(q.querySelectorAll('.opt'));
    var exp = q.querySelector('.exp');
    var btn = q.querySelector('.mcheck');
    var locked = false;

    opts.forEach(function (o, i) {
      o.addEventListener('click', function () {
        if (locked) return;
        o.classList.toggle('sel');
      });
    });

    if (!btn) return;
    btn.addEventListener('click', function () {
      if (locked) return;
      locked = true;
      done++;
      var picked = [];
      opts.forEach(function (o, i) { if (o.classList.contains('sel')) picked.push(i); });

      var correct = picked.length === ans.length &&
        picked.every(function (i) { return ans.indexOf(i) !== -1; });
      if (correct) full++;

      opts.forEach(function (o, i) {
        o.classList.remove('sel');
        var isAns = ans.indexOf(i) !== -1;
        var wasPicked = picked.indexOf(i) !== -1;
        if (isAns) o.classList.add('right');
        else if (wasPicked) o.classList.add('wrong');
      });

      var verdict = document.createElement('div');
      verdict.style.cssText = 'margin-top:10px;font-weight:700;color:' +
        (correct ? 'var(--ok)' : 'var(--bad)');
      verdict.textContent = correct
        ? '✅ 完全正確，得 5 分'
        : '❌ 未全部選對 → 這題 0 分（考試規則：必須全選對才給分）';
      q.appendChild(verdict);

      if (exp) exp.classList.add('show');
      btn.style.display = 'none';
      refresh();
    });
  });
  refresh();
})();

/* ---- 3. 形態學互動格子（ch6） ---- */
/* 用法：<div id="morphDemo"></div> */
(function () {
  var host = document.getElementById('morphDemo');
  if (!host) return;
  var N = 11;
  var grid = [];
  for (var i = 0; i < N; i++) { grid.push(new Array(N).fill(0)); }
  // 預設圖形：一個 7×7 大方塊（中間有個小洞）+ 一個孤立雜點
  for (var y = 1; y <= 7; y++) for (var x = 1; x <= 7; x++) grid[y][x] = 1;
  grid[4][4] = 0;   // 中間的小洞 → 用 Closing 可以補起來
  grid[9][9] = 1;   // 孤立雜點   → 用 Opening 可以去掉

  var original = grid.map(function (r) { return r.slice(); });

  function se() { return [[0,1,0],[1,1,1],[0,1,0]]; } // 十字 SE

  function apply(g, mode) {
    var s = se(), out = [];
    for (var y = 0; y < N; y++) {
      out.push(new Array(N).fill(0));
      for (var x = 0; x < N; x++) {
        var vals = [];
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          if (!s[dy + 1][dx + 1]) continue;
          var yy = y + dy, xx = x + dx;
          vals.push((yy < 0 || yy >= N || xx < 0 || xx >= N) ? 0 : g[yy][xx]);
        }
        out[y][x] = (mode === 'erode') ? (vals.every(function (v) { return v === 1; }) ? 1 : 0)
                                       : (vals.some(function (v) { return v === 1; }) ? 1 : 0);
      }
    }
    return out;
  }

  function draw() {
    var h = '<div class="mat" style="grid-template-columns:repeat(' + N + ',1fr)">';
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      h += '<span class="' + (grid[y][x] ? 'on' : '') + '" data-y="' + y + '" data-x="' + x + '"></span>';
    }
    h += '</div>';
    cells.innerHTML = h;
    cells.querySelectorAll('span').forEach(function (c) {
      c.addEventListener('click', function () {
        var y = +c.dataset.y, x = +c.dataset.x;
        grid[y][x] = grid[y][x] ? 0 : 1;
        draw();
      });
    });
  }

  host.innerHTML =
    '<div class="card"><p style="margin-top:0"><strong>動手玩：十字 SE 的侵蝕與膨脹</strong><br>' +
    '<span style="font-size:14px;color:var(--muted)">點格子可自己畫圖形。黑＝前景(1)，白＝背景(0)。</span></p>' +
    '<div id="mcells"></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
    '<button class="btn" data-a="erode">侵蝕 Erosion</button>' +
    '<button class="btn" data-a="dilate">膨脹 Dilation</button>' +
    '<button class="btn ghost" data-a="open">Opening</button>' +
    '<button class="btn ghost" data-a="close">Closing</button>' +
    '<button class="btn ghost" data-a="reset">重設</button></div>' +
    '<p id="mmsg" style="font-size:14px;color:var(--muted);margin-bottom:0"></p></div>';

  var cells = document.getElementById('mcells');
  var msg = document.getElementById('mmsg');
  draw();

  host.querySelectorAll('button[data-a]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.dataset.a;
      if (a === 'reset') { grid = original.map(function (r) { return r.slice(); }); msg.textContent = ''; }
      else if (a === 'erode') { grid = apply(grid, 'erode'); msg.textContent = '侵蝕：圖形變瘦，孤立點消失。'; }
      else if (a === 'dilate') { grid = apply(grid, 'dilate'); msg.textContent = '膨脹：圖形變胖，小洞被填平。'; }
      else if (a === 'open') { grid = apply(apply(grid, 'erode'), 'dilate'); msg.textContent = 'Opening＝先侵蝕再膨脹：去掉小雜點，大塊形狀大致保留。'; }
      else if (a === 'close') { grid = apply(apply(grid, 'dilate'), 'erode'); msg.textContent = 'Closing＝先膨脹再侵蝕：補起小洞與缺口。'; }
      draw();
    });
  });
})();

/* ---- 4. 卷積 vs 相關 小示範（ch4） ---- */
(function () {
  var host = document.getElementById('convDemo');
  if (!host) return;
  var sig = [0, 0, 0, 1, 0, 0, 0, 0];
  var ker = [1, 2, 3, 4, 5];

  function run(flip) {
    var k = flip ? ker.slice().reverse() : ker.slice();
    var pad = k.length - 1;
    var f = new Array(pad).fill(0).concat(sig, new Array(pad).fill(0));
    var out = [];
    for (var i = 0; i + k.length <= f.length; i++) {
      var s = 0;
      for (var j = 0; j < k.length; j++) s += k[j] * f[i + j];
      out.push(s);
    }
    var a = Math.floor(ker.length / 2);
    return { full: out, same: out.slice(a, out.length - a), k: k };
  }

  function row(arr, cls) {
    var h = '<div class="mat" style="grid-template-columns:repeat(' + arr.length + ',1fr)">';
    arr.forEach(function (v) { h += '<span class="' + (cls && v !== 0 ? 'hl' : '') + '">' + v + '</span>'; });
    return h + '</div>';
  }

  function render(flip) {
    var r = run(flip);
    host.querySelector('#cvout').innerHTML =
      '<p style="margin:10px 0 2px"><strong>' + (flip ? '卷積 Convolution（核先翻轉）' : '相關 Correlation（核不翻轉）') + '</strong></p>' +
      '<p style="font-size:14px;color:var(--muted);margin:2px 0">實際使用的核：' + r.k.join(', ') + '</p>' +
      '<p style="font-size:14px;margin:8px 0 2px">full 結果（長度 ' + r.full.length + '）</p>' + row(r.full, 1) +
      '<p style="font-size:14px;margin:8px 0 2px">裁成 same（長度 ' + r.same.length + '，和訊號一樣長）</p>' + row(r.same, 1) +
      '<p style="font-size:14px;color:var(--muted);margin-top:8px">' +
      (flip ? '訊號是脈衝 δ，卷積把「原樣」的核印出來 → 1,2,3,4,5 ✅'
            : '相關印出來的是「左右相反」的核 → 5,4,3,2,1 ⚠️') + '</p>';
  }

  host.innerHTML =
    '<div class="card"><p style="margin-top:0"><strong>動手玩：同一個核，相關 vs 卷積</strong><br>' +
    '<span style="font-size:14px;color:var(--muted)">訊號 f = [0,0,0,1,0,0,0,0]（一個脈衝）、核 w = [1,2,3,4,5]</span></p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">' +
    '<button class="btn" data-f="0">算相關</button>' +
    '<button class="btn ghost" data-f="1">算卷積</button></div><div id="cvout"></div></div>';
  host.querySelectorAll('button[data-f]').forEach(function (b) {
    b.addEventListener('click', function () { render(b.dataset.f === '1'); });
  });
  render(false);
})();

/* ---- 5. 直方圖均衡化計算器（ch3） ---- */
(function () {
  var host = document.getElementById('heDemo');
  if (!host) return;
  // 4x4、灰階只有 0..7（L=8），方便手算
  var img = [[1,1,2,2],[1,2,3,3],[2,3,4,5],[3,4,5,6]];
  var L = 8, N = 16;

  function compute() {
    var h = new Array(L).fill(0);
    img.forEach(function (r) { r.forEach(function (v) { h[v]++; }); });
    var cdf = [], acc = 0;
    for (var i = 0; i < L; i++) { acc += h[i]; cdf.push(acc); }
    var map = cdf.map(function (c) { return Math.round((L - 1) / N * c); });
    return { h: h, cdf: cdf, map: map };
  }

  var r = compute();
  var rows = '';
  for (var i = 0; i < L; i++) {
    rows += '<tr><td>' + i + '</td><td>' + r.h[i] + '</td><td>' + r.cdf[i] + '</td>' +
      '<td>round(7/16 × ' + r.cdf[i] + ') = <strong>' + r.map[i] + '</strong></td></tr>';
  }
  var outImg = img.map(function (row) { return row.map(function (v) { return r.map[v]; }); });

  function mat(m, hl) {
    var h = '<div class="mat" style="grid-template-columns:repeat(4,1fr)">';
    m.forEach(function (row) { row.forEach(function (v) { h += '<span class="' + (hl ? 'hl' : '') + '">' + v + '</span>'; }); });
    return h + '</div>';
  }

  host.innerHTML =
    '<div class="card"><p style="margin-top:0"><strong>完整手算示範：4×4 影像、L=8、N=16</strong></p>' +
    '<div class="matrow"><div><div class="cap">原圖</div>' + mat(img, 0) + '</div>' +
    '<div class="op">→</div><div><div class="cap">均衡化後</div>' + mat(outImg, 1) + '</div></div>' +
    '<div class="tw"><table><tr><th>灰階 r</th><th>個數 h(r)</th><th>累積 cdf(r)</th><th>對應新值 s</th></tr>' +
    rows + '</table></div>' +
    '<p style="font-size:14px;color:var(--muted);margin-bottom:0">' +
    '注意：原本只用到 1~6 這幾級，均衡後被拉開到 0~7，對比變強。' +
    '最大的 cdf 一定等於 N（16），所以最大值必定對應到 L−1（7）。</p></div>';
})();
