/**
 * 비즈플래닛 "챗봇관리" 데모 빌드 스크립트.
 *
 * BLOG-demo 와 같은 방식으로 원본 web/ HTML 을 읽어 정적 데모 화면으로
 * 복제하고, demo.css / demo.js 레이어를 주입한다.
 *
 * 실행:
 *   ../bizp-store-learning-poc/poc-server/node_modules/.bin/tsx build/render.tsx
 *
 * 원본(bizp-store-learning-poc/web)은 절대 수정하지 않는다.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, '..');
const webDir = join(demoDir, '..', 'bizp-store-learning-poc', 'web');

const SCREENS: Array<{ out: string; src: string }> = [
  { out: 'soho_store_register.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_loaded.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_rag_generated.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_download_modal.html', src: 'soho_store_register.html' }
];

function copyAssets(): number {
  let count = 0;
  for (const name of readdirSync(webDir)) {
    const full = join(webDir, name);
    if (!statSync(full).isFile()) continue;
    const ext = extname(name).toLowerCase();
    if (ext === '.html' || ext === '.md') continue;
    copyFileSync(full, join(demoDir, name));
    count += 1;
  }
  return count;
}

function injectDemoLayer(html: string): string {
  const resetStoreScript =
    '<script>try{localStorage.removeItem("bizplanet.storeRegistration.storeId");}catch(e){}</script>';
  let out = html;
  if (out.includes('</head>')) {
    out = out.replace('</head>', `  <link rel="stylesheet" href="demo.css">\n  ${resetStoreScript}\n</head>`);
  }
  if (out.includes('</body>')) {
    out = out.replace('</body>', '  <script defer src="demo.js"></script>\n</body>');
  } else {
    out += '\n<script defer src="demo.js"></script>\n';
  }
  return out;
}

function shellPage(title: string, body: string, extraHead = ''): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · 챗봇관리 데모</title>
<link rel="stylesheet" href="demo.css" />
${extraHead}
</head>
<body>
${body}
<script defer src="demo.js"></script>
</body>
</html>
`;
}

function rbStyles(): string {
  return `<style>
  *{box-sizing:border-box}
  body{margin:0;background:#EEF1F7;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif}
  .rb-shell{min-height:100vh;display:grid;grid-template-columns:232px 1fr;background:#F5F7FB}
  .rb-side{background:#111827;color:#D5DAE7;padding:22px 16px;display:flex;flex-direction:column;gap:18px}
  .rb-brand{font-size:18px;font-weight:900;color:#fff;letter-spacing:.02em}
  .rb-bot{padding:13px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06)}
  .rb-bot-name{font-size:13px;font-weight:800;color:#fff}
  .rb-bot-meta{font-size:11px;color:#9CA3AF;margin-top:4px}
  .rb-nav{display:flex;flex-direction:column;gap:4px}
  .rb-nav a{height:34px;display:flex;align-items:center;padding:0 10px;border-radius:6px;color:#B9C0D0;text-decoration:none;font-size:13px;font-weight:650}
  .rb-nav a.active{background:#2B4FD8;color:#fff}
  .rb-main{padding:28px 32px 56px}
  .rb-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}
  .rb-kicker{font-size:11px;font-weight:800;color:#637089;letter-spacing:.08em;text-transform:uppercase}
  h1{font-size:24px;line-height:1.2;margin:6px 0 8px;color:#111827}
  .rb-desc{font-size:13px;color:#6B7280;line-height:1.55;margin:0}
  .rb-btn{height:34px;border:0;border-radius:6px;background:#2B4FD8;color:#fff;font-weight:800;font-size:13px;padding:0 14px;cursor:pointer}
  .rb-btn.secondary{background:#fff;color:#2B4FD8;border:1px solid #D8E0EC}
  .rb-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
  .rb-metric{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:14px}
  .rb-metric-label{font-size:11px;color:#7B8496;font-weight:700}
  .rb-metric-value{font-size:22px;font-weight:900;color:#111827;margin-top:4px}
  .rb-panel{background:#fff;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:16px}
  .rb-panel-head{height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2E8F0}
  .rb-panel-title{font-size:14px;font-weight:850;color:#111827}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:13px 16px;border-bottom:1px solid #EDF2F7;text-align:left;vertical-align:middle}
  th{font-size:11px;color:#7B8496;background:#FAFBFC;font-weight:800}
  tr:last-child td{border-bottom:0}
  .knowledge-row{cursor:pointer}
  .knowledge-row:hover{background:#F7F9FF}
  .doc-name{font-weight:850;color:#1F2937}
  .doc-sub{font-size:11px;color:#7B8496;margin-top:3px}
  .badge{display:inline-flex;align-items:center;min-height:22px;border-radius:999px;padding:2px 9px;font-size:11px;font-weight:800}
  .badge.green{background:#E8F8EF;color:#178447}
  .badge.blue{background:#EEF2FF;color:#2B4FD8}
  .badge.gray{background:#F1F3F5;color:#667085}
  .detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px}
  .doc-card{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:18px}
  .doc-title{font-size:20px;font-weight:900;margin-bottom:8px}
  .doc-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .form-row{display:grid;grid-template-columns:140px 1fr;gap:12px;padding:13px 0;border-top:1px solid #EDF2F7}
  .form-label{font-size:12px;font-weight:850;color:#4B5563}
  .form-value{font-size:13px;color:#111827;line-height:1.55}
  .vector-box{border:1px solid #D8E0EC;border-radius:8px;padding:14px;background:#FAFBFC}
  .vector-title{font-size:13px;font-weight:900;margin-bottom:10px}
  .progress{height:8px;background:#E8EEF7;border-radius:999px;overflow:hidden}
  .progress span{display:block;height:100%;width:100%;background:#2B4FD8}
  .chunk-list{display:flex;flex-direction:column;gap:8px;margin-top:12px}
  .chunk{padding:10px;border:1px solid #E2E8F0;border-radius:6px;background:#fff;font-size:12px;line-height:1.45;color:#4B5563}
  .demo-rb-action{margin-top:14px;width:100%}
  @media(max-width:900px){.rb-shell{grid-template-columns:1fr}.rb-side{display:none}.rb-grid{grid-template-columns:repeat(2,1fr)}.detail-layout{grid-template-columns:1fr}}
</style>`;
}

function rbListPage(): string {
  return shellPage(
    '챗봇 지식 관리 목록',
    `<div class="rb-shell">
  <aside class="rb-side">
    <div class="rb-brand">RB Dialog</div>
    <div class="rb-bot"><div class="rb-bot-name">해화로in수산 챗봇</div><div class="rb-bot-meta">botId · 8558886c...</div></div>
    <nav class="rb-nav">
      <a href="#">대시보드</a><a href="#" class="active">지식 관리</a><a href="#">대화 이력</a><a href="#">배포 설정</a>
    </nav>
  </aside>
  <main class="rb-main">
    <div class="rb-top">
      <div><div class="rb-kicker">Knowledge Base</div><h1>챗봇 지식 관리</h1><p class="rb-desc">비즈플래닛에서 생성한 RAG 문서를 업로드하고 벡터 임베딩 상태를 관리합니다.</p></div>
      <button class="rb-btn">문서 업로드</button>
    </div>
    <section class="rb-grid">
      <div class="rb-metric"><div class="rb-metric-label">등록 문서</div><div class="rb-metric-value">2</div></div>
      <div class="rb-metric"><div class="rb-metric-label">임베딩 완료</div><div class="rb-metric-value">2</div></div>
      <div class="rb-metric"><div class="rb-metric-label">총 청크</div><div class="rb-metric-value">148</div></div>
      <div class="rb-metric"><div class="rb-metric-label">마지막 동기화</div><div class="rb-metric-value">오늘</div></div>
    </section>
    <section class="rb-panel">
      <div class="rb-panel-head"><div class="rb-panel-title">지식 문서 목록</div><span class="badge blue">해화로in수산</span></div>
      <table>
        <thead><tr><th>문서명</th><th>유형</th><th>청크</th><th>상태</th><th>업데이트</th></tr></thead>
        <tbody>
          <tr class="knowledge-row"><td><div class="doc-name">info_해화로in수산.docx</div><div class="doc-sub">매장 기본정보, 영업시간, 메뉴, 편의시설</div></td><td>업체 정보</td><td>42</td><td><span class="badge green">임베딩 완료</span></td><td>2026-06-16 18:42</td></tr>
          <tr class="knowledge-row"><td><div class="doc-name">reviews_해화로in수산.docx</div><div class="doc-sub">방문자 리뷰 100개와 사장님 답글</div></td><td>리뷰 모음</td><td>106</td><td><span class="badge green">임베딩 완료</span></td><td>2026-06-16 18:43</td></tr>
        </tbody>
      </table>
    </section>
  </main>
</div>`,
    rbStyles()
  );
}

function rbDetailPage(kind: 'info' | 'reviews'): string {
  const isInfo = kind === 'info';
  return shellPage(
    isInfo ? 'info 파일 벡터 임베딩 설정' : 'review 파일 벡터 임베딩 설정',
    `<div class="rb-shell">
  <aside class="rb-side">
    <div class="rb-brand">RB Dialog</div>
    <div class="rb-bot"><div class="rb-bot-name">해화로in수산 챗봇</div><div class="rb-bot-meta">Knowledge detail</div></div>
    <nav class="rb-nav">
      <a href="#">대시보드</a><a href="#" class="active">지식 관리</a><a href="#">대화 이력</a><a href="#">배포 설정</a>
    </nav>
  </aside>
  <main class="rb-main">
    <div class="rb-top">
      <div><div class="rb-kicker">Vector Embedding</div><h1>${isInfo ? '업체 정보 문서 설정' : '방문자 리뷰 문서 설정'}</h1><p class="rb-desc">${isInfo ? '매장 기본정보 문서를 챗봇 답변의 기준 지식으로 사용합니다.' : '리뷰 문서를 고객 질문의 분위기와 추천 답변 근거로 사용합니다.'}</p></div>
      <button class="rb-btn secondary">목록으로</button>
    </div>
    <div class="detail-layout">
      <section class="doc-card">
        <div class="doc-title">${isInfo ? 'info_해화로in수산.docx' : 'reviews_해화로in수산.docx'}</div>
        <div class="doc-meta"><span class="badge green">임베딩 완료</span><span class="badge blue">${isInfo ? '업체 정보' : '리뷰 모음'}</span><span class="badge gray">text-embedding-3-small</span></div>
        <div class="form-row"><div class="form-label">문서 설명</div><div class="form-value">${isInfo ? '상호명, 업종, 위치, 영업시간, 메뉴, 예약, 주차, 편의시설 정보를 포함합니다.' : '방문자 리뷰 100개, 리뷰 작성일, 사장님 답글, 주요 만족/불편 키워드를 포함합니다.'}</div></div>
        <div class="form-row"><div class="form-label">검색 범위</div><div class="form-value">해화로in수산 챗봇 전용 지식베이스</div></div>
        <div class="form-row"><div class="form-label">청크 설정</div><div class="form-value">chunk size 800 · overlap 120 · Korean sentence boundary</div></div>
        <div class="form-row"><div class="form-label">답변 우선순위</div><div class="form-value">${isInfo ? '영업시간, 위치, 예약, 메뉴 질문에 최우선 사용' : '메뉴 추천, 방문 경험, 분위기 질문에 보조 근거로 사용'}</div></div>
      </section>
      <aside class="doc-card">
        <div class="vector-box">
          <div class="vector-title">임베딩 진행률</div>
          <div class="progress"><span></span></div>
          <div class="chunk-list">
            <div class="chunk">${isInfo ? '기본 정보 · 서울 광진구 광나루로 383 1,2층' : '리뷰 요약 · 회가 신선하고 직원 응대가 친절하다는 반응 다수'}</div>
            <div class="chunk">${isInfo ? '영업시간 · 월-목 11:20-23:30, 금-토 24:00까지' : '추천 근거 · 숙성회, 대방어, 물회, 생선구이 언급 빈도 높음'}</div>
            <div class="chunk">${isInfo ? '메뉴 · 모듬 회ㆍ산물, 속초식 항아리 물회, 초신선 활어 3종' : '운영 피드백 · 예약, 단체 이용, 포장/배달 관련 문의 대응 가능'}</div>
          </div>
        </div>
        <button type="button" class="rb-btn demo-rb-action">${isInfo ? 'review 파일 보기' : '챗봇 구현 확인하기'}</button>
      </aside>
    </div>
  </main>
</div>`,
    rbStyles()
  );
}

function chatPage(): string {
  const chatUrl = 'https://chat.rbdialog.co.kr/?botId=8558886c0e8c4b0b849efafe82cc574d';
  return shellPage(
    '실 챗봇 확인',
    `<style>
  body{margin:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;color:#111827}
  .chat-shell{height:100vh;display:grid;grid-template-rows:54px 1fr}
  .chat-head{display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:#111827;color:#fff}
  .chat-title{font-weight:850;font-size:14px}
  .chat-title span{color:#9CA3AF;font-weight:600;margin-left:8px}
  .chat-open{height:32px;border-radius:6px;background:#2B4FD8;color:#fff;text-decoration:none;display:inline-flex;align-items:center;padding:0 12px;font-size:12px;font-weight:800}
  iframe{width:100%;height:100%;border:0;background:#fff}
</style>
<div class="chat-shell">
  <header class="chat-head">
    <div class="chat-title">해화로in수산 실 챗봇 <span>RB Dialog</span></div>
    <a class="chat-open" href="${chatUrl}" target="_blank" rel="noopener noreferrer">새 창으로 열기</a>
  </header>
  <iframe src="${chatUrl}" title="해화로in수산 챗봇"></iframe>
</div>`
  );
}

function indexPage(): string {
  const screens = [
    ['1', '매장 등록 URL 입력', 'soho_store_register.html'],
    ['2', '해화로in수산 정보 불러옴', 'soho_store_register_loaded.html'],
    ['3', 'RAG 문서 생성 완료', 'soho_store_register_rag_generated.html'],
    ['4', '다운로드 완료 팝업', 'soho_store_register_download_modal.html'],
    ['5', '챗봇 지식 관리 목록', 'RB-Dialog-soho1.html'],
    ['6', 'info 문서 임베딩 설정', 'RB-Dialog-soho2.html'],
    ['7', 'review 문서 임베딩 설정', 'RB-Dialog-soho3.html'],
    ['8', '실 챗봇 확인', 'chatbot_live.html']
  ];
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>비즈플래닛 · 챗봇관리 데모</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans KR',sans-serif;background:#F5F6FA;color:#1A1A2E;padding:40px 24px 64px}
.wrap{max-width:1040px;margin:0 auto}.head{margin-bottom:28px}.eyebrow{font-size:12px;font-weight:800;color:#3B5BDB;letter-spacing:.06em;margin-bottom:8px}
h1{font-size:24px;font-weight:900;margin-bottom:10px}.desc{font-size:13px;color:#4A5568;line-height:1.7}.desc code{background:#EEF2FF;color:#2B4FD8;padding:1px 6px;border-radius:5px;font-size:12px}
.start{display:inline-flex;align-items:center;gap:8px;margin-top:18px;height:42px;padding:0 20px;background:#2B4FD8;color:#fff;border-radius:999px;font-weight:850;font-size:14px;text-decoration:none;box-shadow:0 8px 20px rgba(43,79,216,.25)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}.card{display:block;background:#fff;border:1px solid #E8EAF2;border-radius:8px;padding:16px 14px;text-decoration:none;color:inherit;transition:box-shadow .15s,border-color .15s,transform .1s}
.card:hover{border-color:#748FFC;box-shadow:0 6px 18px rgba(59,91,219,.12);transform:translateY(-1px)}.num{width:26px;height:26px;border-radius:7px;background:#EEF2FF;color:#2B4FD8;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.card-title{font-size:13px;font-weight:800;line-height:1.4;margin-bottom:4px}.card-file{font-size:10px;color:#9AA0B4;word-break:break-all}.note{margin-top:18px;font-size:11px;color:#9AA0B4;line-height:1.6}
@media(max-width:880px){.grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div class="eyebrow">BIZPLANET · CHATBOT MANAGEMENT DEMO</div>
    <h1>챗봇관리 화면 데모</h1>
    <p class="desc">네이버 플레이스 데이터로 RAG 문서를 생성하고, RB Dialog 지식 관리에 등록한 뒤 실제 챗봇 동작을 확인하는 8단계 흐름입니다.<br />각 화면 우상단 <strong>데모 바</strong>의 하이라이트를 따라 클릭하면 다음 화면으로 진행됩니다.</p>
    <a class="start" href="soho_store_register.html">시나리오 시작</a>
  </div>
  <div class="grid">
    ${screens
      .map(
        ([n, title, file]) =>
          `<a class="card" href="${file}"><div class="num">${n}</div><div class="card-title">${title}</div><div class="card-file">${file}</div></a>`
      )
      .join('\n    ')}
  </div>
  <p class="note">원본 소스는 수정하지 않고, 이 폴더의 정적 데모 파일만 생성합니다.</p>
</div>
</body>
</html>`;
}

mkdirSync(demoDir, { recursive: true });

const assetCount = copyAssets();
console.log(`✓ 공용 자산 ${assetCount}개 복사`);

for (const screen of SCREENS) {
  const srcHtml = readFileSync(join(webDir, screen.src), 'utf8');
  writeFileSync(join(demoDir, screen.out), injectDemoLayer(srcHtml), 'utf8');
  console.log(`✓ ${screen.out}${screen.out === screen.src ? '' : `  (← ${screen.src})`}`);
}

writeFileSync(join(demoDir, 'RB-Dialog-soho1.html'), rbListPage(), 'utf8');
writeFileSync(join(demoDir, 'RB-Dialog-soho2.html'), rbDetailPage('info'), 'utf8');
writeFileSync(join(demoDir, 'RB-Dialog-soho3.html'), rbDetailPage('reviews'), 'utf8');
writeFileSync(join(demoDir, 'chatbot_live.html'), chatPage(), 'utf8');
writeFileSync(join(demoDir, 'index.html'), indexPage(), 'utf8');

for (const imageName of ['RB-Dialog-soho1.png', 'RB-Dialog-soho2.png', 'RB-Dialog-soho3.png']) {
  const sourceImage = join(demoDir, '..', imageName);
  if (existsSync(sourceImage)) {
    copyFileSync(sourceImage, join(demoDir, imageName));
    console.log(`✓ ${imageName} 복사`);
  }
}

console.log('완료: 챗봇관리 데모 화면 8개 생성');
