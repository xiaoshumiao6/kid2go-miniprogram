(function () {
  'use strict';
  const rawRoot = 'https://raw.githubusercontent.com/xiaoshumiao6/kid2go-miniprogram/main/docs/';
  function imageUrl(file, target, nonce, pageUrl) {
    if (!/^[a-z0-9-]+\.jpg$/.test(file)) throw new Error('Invalid image filename');
    if (!['pages', 'raw'].includes(target)) throw new Error('Invalid image target');
    const url = new URL('images/' + file, target === 'raw' ? rawRoot : pageUrl);
    if (nonce) url.searchParams.set('probe', String(nonce));
    return url.href;
  }
  function summarize(rows) {
    const ok = rows.filter(r => r.ok);
    const values = ok.map(r => r.durationMs).sort((a, b) => a - b);
    return { total: rows.length, succeeded: ok.length, failed: rows.length - ok.length,
      medianSuccessMs: values.length ? Math.round((values[Math.floor((values.length - 1) / 2)] + values[Math.floor(values.length / 2)]) / 2) : null };
  }
  function validateManifest(data) {
    if (data.schemaVersion !== 1 || !Array.isArray(data.images) || data.images.length !== 5) throw new Error('Expected exactly five test images');
    if (new Set(data.images.map(x => x.file)).size !== 5) throw new Error('Duplicate image');
    for (const r of data.images) {
      imageUrl(r.file, 'pages', '', 'https://example.invalid/test/');
      if (!/^[a-f0-9]{64}$/.test(r.sha256) || !Number.isInteger(r.bytes) || r.bytes <= 0 || r.bytes > 100 * 1024) throw new Error('Invalid image metadata');
      if (new URL(r.sourcePage).origin !== 'https://commons.wikimedia.org') throw new Error('Invalid source page');
      if (new URL(r.licenseUrl).origin !== 'https://creativecommons.org') throw new Error('Invalid license URL');
      if (!r.photographer || !r.nameZh || !r.captureDate) throw new Error('Missing image credit');
    }
    return data;
  }
  if (typeof module === 'object' && module.exports) module.exports = { imageUrl, summarize, validateManifest };
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const records = [], cards = new Map();
  let manifest;
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function link(text, href) {
    const a = node('a', text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function render(r) {
    const card = node('article'); card.append(node('h2', r.nameZh));
    const frame = node('div', undefined, 'frame'), img = node('img'); img.alt = r.nameZh + '历史实景候选'; img.referrerPolicy = 'no-referrer';
    frame.append(img); card.append(frame);
    const result = node('p', '未加载图片', 'result'); card.append(result);
    card.append(node('p', '摄影：' + r.photographer + ' · 拍摄：' + r.captureDate, 'credit'));
    const credit = node('p', undefined, 'credit'); credit.append(link('来源页', r.sourcePage), document.createTextNode(' · '), link(r.licenseLabel, r.licenseUrl));
    card.append(credit, node('p', r.scopeZh, 'credit'), node('p', r.changeNoticeZh, 'credit'));
    $('photos').append(card); cards.set(r.file, { img, result });
  }
  function measure(r, url) {
    return new Promise(resolve => {
      const { img, result } = cards.get(r.file), start = performance.now(); let finished = false;
      const finish = (ok, failure) => {
        if (finished) return; finished = true; clearTimeout(timer);
        img.onload = null; img.onerror = null;
        const durationMs = Math.round(performance.now() - start);
        if (!ok) img.removeAttribute('src');
        result.textContent = ok ? '成功 · ' + durationMs + ' ms' : '失败 · ' + (failure || '加载错误');
        resolve({ file: r.file, url, expectedBytes: r.bytes, ok, failure: failure || null, durationMs });
      };
      const timer = setTimeout(() => finish(false, '20秒超时'), 20000);
      img.onload = () => finish(true); img.onerror = () => finish(false, 'load error');
      result.textContent = '加载中……'; img.src = url;
    });
  }
  async function run(fresh) {
    $('normal').disabled = $('fresh').disabled = true; $('target').disabled = true;
    try {
      const target = $('target').value, nonce = fresh ? Date.now().toString(36) : '', began = performance.now();
      $('status').textContent = '正在加载5张图片……';
      const rows = await Promise.all(manifest.images.map(r => measure(r, imageUrl(r.file, target, nonce, location.href))));
      const totalElapsedMs = Math.round(performance.now() - began), summary = summarize(rows);
      records.push({ at: new Date().toISOString(), page: location.href.split('?')[0], target,
        networkNote: $('network').value, queryChanged: fresh, totalElapsedMs, summary, rows,
        limitation: 'Source thumbnails only. Browser/CDN cache state is not controlled. Not a mini-program acceptance test.' });
      $('results').value = JSON.stringify(records, null, 2);
      $('status').textContent = '完成：' + summary.succeeded + '/5成功，整组耗时' + totalElapsedMs + ' ms。请切换网络重复测试；不要只凭一次结果决定正式图片源。';
    } catch (e) { $('status').textContent = '测试未完成：' + e.message; }
    finally { $('normal').disabled = $('fresh').disabled = false; $('target').disabled = false; }
  }
  fetch('sources.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('无法读取清单'); return r.json(); })
    .then(data => { manifest = validateManifest(data); manifest.images.forEach(render); $('status').textContent = '已就绪。点击按钮后才会请求图片。'; $('normal').disabled = $('fresh').disabled = false; })
    .catch(e => { $('status').textContent = '初始化失败：' + e.message + '。请通过GitHub Pages的HTTPS地址打开，不是本地file地址。'; });
  $('normal').addEventListener('click', () => run(false)); $('fresh').addEventListener('click', () => run(true));
})();
