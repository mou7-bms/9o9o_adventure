// عناصر الواجهة
const startScreen = document.getElementById('start-screen');
const settingsScreen = document.getElementById('settings-screen');
const levelsScreen = document.getElementById('levels-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const startAR = document.getElementById('start-ar');
const startEN = document.getElementById('start-en');
const settingsBtn = document.getElementById('settings-btn');
const exitBtn = document.getElementById('exit-btn');

const settingsBack = document.getElementById('settings-back');
const langArBtn = document.getElementById('lang-ar-btn');
const langEnBtn = document.getElementById('lang-en-btn');
const soundOnBtn = document.getElementById('sound-on-btn');
const soundOffBtn = document.getElementById('sound-off-btn');

const levelItems = document.querySelectorAll('.level-item');
const levelsBack = document.getElementById('levels-back');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const livesArea = document.getElementById('lives-area');
const scoreElem = document.getElementById('score');
const levelElem = document.getElementById('level');

const toLevelsBtn = document.getElementById('to-levels');
const retryBtn = document.getElementById('retry');
const inExit = document.getElementById('in-exit');
const inRepeat = document.getElementById('in-repeat');

let language = 'ar';
let soundOn = true;
let currentLevel = 1;
let unlockedLevels = [1]; // levels unlocked
let score = 0;
let lives = 3;
let invulnerable = false; // when eating
let gameLoopId = null;

// تحميل أصوات
const sfx = {
  music: new Audio('sounds/game-music.mp3'),
  toNext: new Audio('sounds/to-thenext.wav'),
  finalFall: new Audio('sounds/final-fall.wav'),
  strong: new Audio('sounds/strong.wav'),
  jump: new Audio('sounds/jump.wav'),
  win: new Audio('sounds/win-game.wav'),
  princess: new Audio('sounds/princess.wav'),
  alopecia: new Audio('sounds/Alopecia.wav'),
  lose1: new Audio('sounds/lose1.wav'),
  food: new Audio('sounds/food.wav'),
  fruit: new Audio('sounds/fruit.wav'),
  rabbit: new Audio('sounds/rabbit.wav')
};

// loop music
sfx.music.loop = true;

// قائمة الخلفيات للمراحل
const backgrounds = {
  1: 'images/forest-background.jpg',
  2: 'images/snow-background.jpg',
  3: 'images/Mountains-background.jpg',
  4: 'images/monster-background.jpg',
  5: 'images/finall-background.jpg'
};

// عوائق و منصات واكلات لكل مرحلة (أسماء الملفات كما أعطيت)
const levelData = {
  1: {
    platform: 'images/forest-platform.png',
    obstacles: ['images/rabbit.png','images/Cub.png','images/mushroom.png','images/fox.png'],
    foods: ['images/strawberry.png','images/watermelon.png','images/apple.png','images/banana.png']
  },
  2: {
    platform: 'images/snow-platform.png',
    obstacles: ['images/bear.png','images/dinosaur.png','images/Alopecia.png','images/dolphin.png'],
    foods: ['images/strawberry.png','images/watermelon.png','images/apple.png','images/banana.png']
  },
  3: {
    platform: 'images/mountain-platform.png',
    obstacles: ['images/monkey.png','images/frog.png','images/tree.png','images/fox.png','images/bear.png','images/wild-mushroom.png','images/Cub.png'],
    foods: ['images/panini.png','images/pizza.png','images/burger.png']
  },
  4: {
    platform: 'images/monster-platform.png',
    obstacles: ['images/monkey.png','images/frog.png','images/tree.png','images/fox.png','images/bear.png','images/wild-mushroom.png','images/Cub.png','images/squach.png','images/crazy-lion.png'],
    foods: ['images/panini.png','images/pizza.png','images/burger.png','images/strawberry.png','images/watermelon.png','images/apple.png','images/banana.png']
  },
  5: {
    platform: 'images/monster-platform.png',
    obstacles: ['images/crocodile.png','images/dragon.png','images/Alopecia.png','images/tree.png','images/carzy-princess.png','images/crazy-prince.png'],
    foods: ['images/panini.png','images/pizza.png','images/burger.png','images/strawberry.png','images/watermelon.png','images/apple.png','images/banana.png']
  }
};

// شخصية الصور
const playerSprites = {
  idle: 'images/9o9o-idle.png',
  move: 'images/9o9o-move.png',
  eating: 'images/9o9o-eating.png',
  run1: 'images/9o9o-run1.png',
  run2: 'images/9o9o-run2.png',
  fall: 'images/9o9o-fall.png'
};

// canvas sizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// واجهة: تبديل اللغة
function setLanguage(lang){
  language = lang;
  if(lang==='ar'){
    langArBtn.classList.remove('hidden');
    langEnBtn.classList.add('hidden');
    startAR.classList.remove('hidden');
    startEN.classList.add('hidden');
  } else {
    langArBtn.classList.add('hidden');
    langEnBtn.classList.remove('hidden');
    startAR.classList.add('hidden');
    startEN.classList.remove('hidden');
  }
}

// صوت: تبديل
function setSound(on){
  soundOn = on;
  if(on){
    soundOnBtn.classList.remove('hidden');
    soundOffBtn.classList.add('hidden');
    sfx.music.play().catch(()=>{});
  } else {
    soundOnBtn.classList.add('hidden');
    soundOffBtn.classList.remove('hidden');
    sfx.music.pause();
  }
}

// بناء واجهة الرؤوس (الحياة)
function renderLives(){
  livesArea.innerHTML = '';
  for(let i=0;i<3;i++){
    const img = document.createElement('img');
    img.src = (i < lives) ? 'images/heart.png' : 'images/black-heart.png';
    livesArea.appendChild(img);
  }
}

// أحداث الأزرار (Start / Settings / Exit)
settingsBtn.onclick = ()=>{
  startScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
};
exitBtn.onclick = ()=>{ window.close ? window.close() : alert('أغلق التطبيق يدوياً'); };

settingsBack.onclick = ()=>{
  settingsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
};

langArBtn.onclick = ()=> setLanguage('ar');
langEnBtn.onclick = ()=> setLanguage('en');

soundOnBtn.onclick = ()=> setSound(false);
soundOffBtn.onclick = ()=> setSound(true);

// بدء عرض قائمة المراحل عند الضغط على START (حسب اللغة نعرض زر مناسب)
startAR.onclick = ()=> {
  startScreen.classList.add('hidden');
  levelsScreen.classList.remove('hidden');
  prepareLevels();
};
startEN.onclick = ()=> {
  startScreen.classList.add('hidden');
  levelsScreen.classList.remove('hidden');
  prepareLevels();
};

levelsBack.onclick = ()=>{
  levelsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
};

// إعداد المراحل: ضبط الأقفال حسب unlockedLevels
function prepareLevels(){
  levelItems.forEach(item=>{
    const lvl = parseInt(item.dataset.level);
    if(unlockedLevels.includes(lvl)){
      item.classList.remove('locked');
      const lockImg = item.querySelector('.lock');
      if(lockImg) lockImg.style.display='none';
    } else {
      item.classList.add('locked');
      const lockImg = item.querySelector('.lock');
      if(lockImg) lockImg.style.display='block';
    }
  });
}

// اختيار مستوى
levelItems.forEach(it=>{
  it.onclick = ()=>{
    const lvl = parseInt(it.dataset.level);
    if(!unlockedLevels.includes(lvl)) { alert('هذه المرحلة مقفلة'); return; }
    currentLevel = lvl;
    startLevel(currentLevel);
    levelsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  };
});

// ------------------ لوجيك اللعب المبسط ------------------
let player = { x:100, y:100, w:100, h:100, vy:0, onGround:false, sprite: new Image() };
player.sprite.src = playerSprites.idle;

let objects = []; // obstacles/fh
let platforms = [];
let lastSpawn = 0;
let spawnInterval = 1200; // ms
let lastTime = 0;

function startLevel(lvl){
  score = 0;
  lives = 3;
  invulnerable = false;
  renderLives();
  scoreElem.textContent = score;
  levelElem.textContent = lvl;
  // تحميل الخلفية محددة
  canvas.style.background = `url(${backgrounds[lvl]}) center / cover no-repeat`;
  // إعداد المنصة الأساسية
  platforms = [{ x:0, y: canvas.height - 120, w: canvas.width, h: 120, img: levelData[lvl].platform }];
  // تصفية العناصر
  objects = [];
  sfx.music.play().catch(()=>{});
  lastSpawn = performance.now();
  lastTime = performance.now();
  if(gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(gameLoop);
}

// دالة إنشاء عوائق وأطعمة عشوائياً
function spawnObjects(now){
  if(now - lastSpawn < spawnInterval) return;
  lastSpawn = now;
  const lvl = currentLevel;
  // احتمال للـ obstacle
  if(Math.random() < 0.6){
    const obsList = levelData[lvl].obstacles;
    const pick = obsList[Math.floor(Math.random()*obsList.length)];
    const obj = { type:'obstacle', img: pick, x: canvas.width + 60, y: canvas.height - 180 - Math.random()*120, w:80, h:80, vx: - (4 + lvl) };
    // أحياناً تكون طائرة
    if(Math.random() < 0.25) obj.y -= 150;
    objects.push(obj);
  }
  // احتمال للفواكه
  if(Math.random() < 0.5){
    const fd = levelData[currentLevel].foods;
    const pick = fd[Math.floor(Math.random()*fd.length)];
    objects.push({ type:'food', img: pick, x: canvas.width + 60, y: canvas.height - 200 - Math.random()*160, w:48, h:48, vx: - (3 + level) });
  }
}

// مساعدة رسم صورة على الكانڤاس
function drawImageObj(o){
  const img = new Image();
  img.src = o.img;
  ctx.drawImage(img, o.x, o.y, o.w, o.h);
}

// فيسبوك تبسيط: ارسم اللاعب كصورة
function drawPlayer(){
  const pimg = new Image();
  pimg.src = player.sprite.src;
  ctx.drawImage(pimg, player.x, player.y, player.w, player.h);
}

// تصادم بسيط
function isCollide(a,b){
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function loseLife(){
  if(invulnerable) return;
  lives--;
  renderLives();
  sfx.lose1.play().catch(()=>{});
  if(lives <= 0){
    endGame(false);
    return;
  }
}

// نهاية اللعبة
function endGame(won){
  cancelAnimationFrame(gameLoopId);
  gameLoopId = null;
  sfx.music.pause();
  gameScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');
  document.getElementById('end-title').textContent = won ? '🎉 لقد فزت!' : '😢 انتهت محاولاتك';
  // لو فاز: افتح المستوى التالي
  if(won && !unlockedLevels.includes(currentLevel+1) && currentLevel<5) unlockedLevels.push(currentLevel+1);
}

// زر العودة لقائمة المراحل
toLevelsBtn.onclick = ()=>{
  endScreen.classList.add('hidden');
  levelsScreen.classList.remove('hidden');
  prepareLevels();
};

// زر إعادة المحاولة
retryBtn.onclick = ()=>{
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
};

// تفاعل القفز على اللمس/الضغط
window.addEventListener('touchstart', ()=>{
  if(player.onGround){
    player.vy = -18;
    player.onGround = false;
    if(soundOn) sfx.jump.play().catch(()=>{});
  }
});

// زر الخروج وإعادة المحاولة داخل اللعب
inExit.onclick = ()=>{ if(confirm('هل تريد الخروج من اللعبة؟')) location.reload(); };
inRepeat.onclick = ()=> startLevel(currentLevel);

// حلقة اللعب
function gameLoop(now){
  const dt = (now - lastTime) / 16.666; // تقريب لمعدّل 60fps
  lastTime = now;

  // تنظيف
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // جاذبية وموضع اللاعب
  player.vy += 0.9;
  player.y += player.vy;
  if(player.y + player.h >= canvas.height - 120){
    player.y = canvas.height - 120 - player.h;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // تحريك العناصر
  objects.forEach(o => { o.x += o.vx; });
  objects = objects.filter(o => o.x + o.w > -50);

  // اصطدامات
  objects.forEach((o, idx) => {
    const obRect = { x:o.x, y:o.y, w:o.w, h:o.h };
    const playerRect = { x:player.x, y:player.y, w:player.w, h:player.h };
    if(isCollide(playerRect, obRect)){
      if(o.type === 'obstacle'){
        if(!invulnerable){
          loseLife();
          // تتصرف بحسب نوع العائق (أصوات خاصة)
          if(o.img.includes('rabbit')) sfx.rabbit.play().catch(()=>{});
          if(o.img.includes('Alopecia')) sfx.alopecia.play().catch(()=>{});
        } else {
          // لو كان محصناً لا يخسر
        }
        // نحذف العقبة بعد الاصطدام
        objects.splice(idx,1);
      } else if(o.type === 'food'){
        // أكل الطعام: زيادة نقاط ومناعة مؤقتة
        score += 1;
        scoreElem.textContent = score;
        invulnerable = true;
        setTimeout(()=>{ invulnerable = false; }, 5000); // مناعة 5 ثواني
        if(soundOn) {
          if(o.img.includes('pizza') || o.img.includes('panini') || o.img.includes('burger')) sfx.food.play().catch(()=>{});
          else sfx.fruit.play().catch(()=>{});
        }
        objects.splice(idx,1);
      }
    }
  });

  // رسم المنصات
  platforms.forEach(pl=>{
    const pimg = new Image();
    pimg.src = pl.img;
    ctx.drawImage(pimg, pl.x, pl.y, pl.w, pl.h);
  });

  // رسم الأشياء واللاعب
  objects.forEach(o => drawImageObj(o));
  drawPlayer();

  // تحقق فوز المستوى: شرط مبسط — جمع 20 نقطة أو بعد وقت معين
  if(score >= 20){
    sfx.toNext.play().catch(()=>{});
    endGame(true);
    return;
  }

  // استمر بالحلقة
  spawnObjects(now);
  gameLoopId = requestAnimationFrame(gameLoop);
}

// عند البدء: إعداد الأيقونات والـ lives
renderLives();
setLanguage('ar');
setSound(true);
prepareLevels();