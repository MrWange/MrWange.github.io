// 检测是否为移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 添加一个变量来记录上一个视图状态
let lastViewState = null;

// 创建粒子效果
function createParticles() {
    const container = document.getElementById('particlesContainer');
    const particleCount = isMobile ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

// 初始化触摸事件
function initTouchEvents() {
    const touchElements = document.querySelectorAll('.touch-feedback');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('active');
        });
    });
}

// 密码验证
function checkPassword() {
    const password = document.getElementById('password-input').value;
    const passwordInput = document.getElementById('password-input');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    
    const validPasswords = ['5623', '7895', '1548', '6397', '4568'];
    
    if (validPasswords.includes(password)) {
        // 添加成功动画
        passwordInput.style.borderColor = '#4CAF50';
        passwordInput.style.backgroundColor = 'rgba(76, 175, 180, 0.1)';
        
        // 创建成功粒子效果
        createSuccessParticles(passwordInput);
        
        // 隐藏密码区域，显示邀请函内容
        passwordSection.style.display = 'none';
        invitationContent.style.display = 'block';
        invitationContent.classList.add('fade-scale-in');
        
        const contentItems = document.querySelectorAll('.content-item');
        contentItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, 200 * (index + 1));
        });

        bindConfirmButton();
    } else {
        // 添加错误动画
        passwordInput.classList.add('shake');
        passwordInput.style.borderColor = '#ff4444';
        passwordInput.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
        
        // 创建错误粒子效果
        createErrorParticles(passwordInput);
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = '密码错误，请重试！';
        passwordSection.appendChild(errorMessage);
        
        setTimeout(() => {
            passwordInput.classList.remove('shake');
            passwordInput.style.borderColor = '';
            passwordInput.style.backgroundColor = '';
            errorMessage.remove();
        }, 1000);
        
        passwordInput.value = '';
    }
}

// 创建成功粒子效果
function createSuccessParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #4CAF50;
            border-radius: 50%;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            animation: successParticle 0.8s ease-out forwards;
        `;
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }
}

// 创建错误粒子效果
function createErrorParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'error-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #ff4444;
            border-radius: 50%;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            animation: errorParticle 0.6s ease-out forwards;
        `;
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    }
}

// 绑定确认按钮事件
function bindConfirmButton() {
    const confirmButton = document.querySelector('.rsvp-button.content-item');
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            const timelineContainer = document.getElementById('timeline-container');
            const contentSections = document.getElementById('content-sections');
            const invitationCard = document.querySelector('.invitation-card');
            
            showLoadingIndicator();
            
            // 先隐藏邀请卡
            invitationCard.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                invitationCard.style.display = 'none';
                hideLoadingIndicator();
                
                // 显示时间轴和内容区域
                timelineContainer.classList.remove('hidden');
                contentSections.classList.remove('hidden');
                
                // 添加淡入动画
                timelineContainer.style.opacity = '1';
                contentSections.style.opacity = '1';
                
                // 初始化滚动监听
                initScrollListener();
                
                // 滚动到第一个部分
                setTimeout(() => {
                    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }, 800);
        });
    }
}

// 加载指示器
function showLoadingIndicator() {
    let loadingIndicator = document.getElementById('loading-indicator');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'loading-indicator';
        
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="loading-text">内容加载中...</p>
        `;
        
        document.body.appendChild(loadingIndicator);
    } else {
        loadingIndicator.classList.remove('hidden', 'fade-out');
    }
    
    loadingIndicator.style.opacity = '1';
    loadingIndicator.style.display = 'flex';
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(loadingIndicator)) {
                loadingIndicator.remove();
            }
        }, 500);
    }
}

// 预加载内容
function preloadSectionContent() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        window.getComputedStyle(section).background;
        
        const sectionId = section.id;
        if (sectionId === 'murder') {
            const bloodSplatter = document.createElement('div');
            bloodSplatter.className = 'blood-splatter';
            bloodSplatter.style.opacity = '0';
            section.appendChild(bloodSplatter);
        } else if (sectionId === 'escape') {
            const modules = section.querySelectorAll('.escape-module');
            modules.forEach(module => {
                window.getComputedStyle(module).transform;
            });
        }
    });
}

// 滚动监听
function initScrollListener() {
    const sections = document.querySelectorAll('.section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxBg = document.querySelector('.parallax-bg');
        if (parallaxBg) {
            parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    const handleScroll = debounce(() => {
        initVisibleSections();
    }, 100);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                timelineItems.forEach(item => {
                    if (item.dataset.section === sectionId) {
                        item.classList.add('active');
                        // 添加高亮动画
                        item.style.animation = 'timelineHighlight 0.5s ease-out';
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: [0.2, 0.5, 0.8],
        rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    window.addEventListener('scroll', handleScroll);
}

// 初始化可见部分
function initVisibleSections() {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    const windowMiddle = windowHeight / 2;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;
        const distanceFromMiddle = Math.abs(sectionMiddle - windowMiddle);
        
        if (distanceFromMiddle < windowHeight * 0.4) {
            section.classList.add('visible');
            // 添加视差效果
            const speed = 0.5;
            const yPos = -(rect.top - windowMiddle) * speed;
            section.style.transform = `translateY(${yPos}px)`;
        } else {
            section.classList.remove('visible');
            section.style.transform = 'translateY(0)';
        }
    });
}

// 关闭密码输入区域
function closePasswordSection() {
    const invitationCard = document.querySelector('.invitation-card');
    const passwordSection = document.getElementById('password-section');
    
    passwordSection.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        invitationCard.style.display = 'none';
        // 记录状态为密码输入
        lastViewState = 'password';
        // 显示挽留界面
        const cryingMessage = document.getElementById('crying-message');
        cryingMessage.classList.remove('hidden');
        cryingMessage.classList.add('fade-scale-in');
    }, 500);
}

// 关闭邀请函
function closeInvitation() {
    const invitationCard = document.querySelector('.invitation-card');
    const invitationContent = document.getElementById('invitation-content');
    const passwordSection = document.getElementById('password-section');
    const cryingMessage = document.getElementById('crying-message');
    
    invitationContent.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        invitationCard.style.display = 'none';
        // 记录状态为邀请函
        lastViewState = 'invitation';
        // 显示挽留界面
        cryingMessage.classList.remove('hidden');
        cryingMessage.classList.add('fade-scale-in');
    }, 500);
}

// 恢复上一个视图
function restoreLastView() {
    const cryingMessage = document.getElementById('crying-message');
    const invitationCard = document.querySelector('.invitation-card');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    const contentSections = document.getElementById('content-sections');
    const timelineContainer = document.getElementById('timeline-container');
    
    // 先隐藏哭泣提示界面
    cryingMessage.classList.remove('fade-scale-in');
    cryingMessage.classList.add('hidden');
    
    // 根据上一个状态显示对应内容
    switch(lastViewState) {
        case 'invitation':
            // 返回邀请函
            invitationCard.style.display = 'block';
            invitationContent.style.display = 'block';
            passwordSection.style.display = 'none';
            invitationContent.classList.add('fade-scale-in');
            break;
            
        case 'password':
            // 返回密码输入界面
            invitationCard.style.display = 'block';
            passwordSection.style.display = 'block';
            invitationContent.style.display = 'none';
            break;
            
        default:
            // 默认显示内容区域
            invitationCard.style.display = 'none';
            timelineContainer.classList.remove('hidden');
            contentSections.classList.remove('hidden');
            timelineContainer.style.opacity = '1';
            contentSections.style.opacity = '1';
            
            initScrollListener();
            
            setTimeout(() => {
                document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
            }, 100);
    }
    
    // 重置状态
    lastViewState = null;
}

// 初始化移动端增强功能
function initMobileEnhancements() {
    if (isMobile) {
        // 添加触摸反馈
        initTouchEvents();
        
        // 优化滚动性能
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // 禁用双击缩放
        document.addEventListener('dblclick', function(e) {
            e.preventDefault();
        });
        
        // 优化按钮点击区域
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
    }
}

// 初始化剧本杀特效
function initMurderEffects() {
    const murderSection = document.getElementById('murder');
    if (!murderSection) return;

    // 添加鼠标移动视差效果
    murderSection.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 移动背景装饰元素
        const decorations = this.querySelectorAll('.decoration-item');
        decorations.forEach(decoration => {
            const speed = 0.1;
            const moveX = (x - rect.width / 2) * speed;
            const moveY = (y - rect.height / 2) * speed;
            decoration.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // 添加点击特效
    murderSection.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 创建血滴效果
        createBloodDrop(x, y);
        
        // 随机播放恐怖音效
        playRandomHorrorSound();
    });

    // 添加悬停特效
    const contentParagraphs = murderSection.querySelectorAll('.section-content p');
    contentParagraphs.forEach(paragraph => {
        paragraph.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
            
            // 添加恐怖装饰
            const decoration = document.createElement('div');
            decoration.className = 'hover-decoration';
            decoration.innerHTML = '👻';
            this.appendChild(decoration);
            
            setTimeout(() => {
                decoration.remove();
            }, 1000);
        });
        
        paragraph.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 创建血滴效果
function createBloodDrop(x, y) {
    const drop = document.createElement('div');
    drop.className = 'blood-drop';
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;
    
    document.getElementById('murder').appendChild(drop);
    
    setTimeout(() => {
        drop.remove();
    }, 1000);
}

// 播放随机恐怖音效
function playRandomHorrorSound() {
    const sounds = [
        'sounds/creak.mp3',
        'sounds/whisper.mp3',
        'sounds/scream.mp3'
    ];
    
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.3;
    audio.play().catch(() => {
        // 忽略自动播放限制错误
    });
}

// 初始化密室逃脱解密元素
function initEscapeRoomPuzzles() {
    const puzzleItems = document.querySelectorAll('.puzzle-item');
    const digitInputs = document.querySelectorAll('.digit-input');
    const submitCodeButton = document.querySelector('.submit-code');
    let solvedPuzzles = new Set();
    
    // 初始化数字输入框
    digitInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < digitInputs.length - 1) {
                    digitInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                digitInputs[index - 1].focus();
            }
        });
    });
    
    // 点击谜题显示内容
    puzzleItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('.puzzle-content');
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                content.style.animation = 'fadeIn 0.5s ease-out';
            }
        });
    });
    
    // 摩斯密码谜题
    const morseInput = document.querySelector('[data-puzzle="morse"] .puzzle-input');
    const morseCheckButton = document.querySelector('[data-puzzle="morse"] .check-button');
    
    if (morseCheckButton) {
        morseCheckButton.addEventListener('click', () => {
            const answer = morseInput.value.toLowerCase().trim();
            if (answer === 'square') {
                solvedPuzzles.add('morse');
                const morseClue = document.querySelector('[data-puzzle="morse"] .hidden-clue');
                if (morseClue) {
                    morseClue.classList.add('revealed');
                    // 添加成功动画和音效
                    createSuccessParticles(morseCheckButton);
                    playSuccessSound();
                }
                morseCheckButton.textContent = '已解锁 ✓';
                morseCheckButton.disabled = true;
                morseCheckButton.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            } else {
                shakePuzzle(morseInput);
                playErrorSound();
            }
        });
    }
    
    // 光线谜题
    const lights = document.querySelectorAll('.light');
    const lightPattern = ['on', 'off', 'on', 'on'];
    let currentPattern = ['off', 'off', 'off', 'off'];
    
    lights.forEach((light, index) => {
        light.addEventListener('click', () => {
            const newState = light.getAttribute('data-state') === 'off' ? 'on' : 'off';
            light.setAttribute('data-state', newState);
            currentPattern[index] = newState;
            
            if (arraysEqual(currentPattern, lightPattern)) {
                solvedPuzzles.add('light');
                revealClue(document.querySelector('[data-puzzle="light"]'));
            }
        });
    });
    
    // 数字推理谜题
    const numberInput = document.querySelector('[data-puzzle="numbers"] .puzzle-input');
    const numberCheckButton = document.querySelector('[data-puzzle="numbers"] .check-button');
    
    if (numberCheckButton) {
        numberCheckButton.addEventListener('click', () => {
            if (numberInput.value === '13') {
                solvedPuzzles.add('numbers');
                revealClue(document.querySelector('[data-puzzle="numbers"]'));
                numberCheckButton.textContent = '已解锁 ✓';
                numberCheckButton.disabled = true;
            } else {
                shakePuzzle(numberInput);
            }
        });
    }
    
    // 音乐解谜
    const notes = document.querySelectorAll('.note');
    const correctSequence = ['C', 'E', 'D', 'C'];
    let currentSequence = [];
    
    notes.forEach(note => {
        note.addEventListener('click', () => {
            playNote(note.getAttribute('data-note'));
            note.classList.add('active');
            
            setTimeout(() => note.classList.remove('active'), 500);
            
            currentSequence.push(note.getAttribute('data-note'));
            if (currentSequence.length === correctSequence.length) {
                if (arraysEqual(currentSequence, correctSequence)) {
                    solvedPuzzles.add('music');
                    revealClue(document.querySelector('[data-puzzle="music"]'));
                } else {
                    currentSequence = [];
                    shakePuzzle(document.querySelector('.music-notes'));
                }
            }
        });
    });
    
    // 提交最终密码
    if (submitCodeButton) {
        submitCodeButton.addEventListener('click', () => {
            const code = Array.from(digitInputs).map(input => input.value).join('');
            if (code === '2853') {
                const successMessage = document.querySelector('.success-message');
                successMessage.classList.remove('hidden');
                successMessage.style.animation = 'fadeIn 0.5s ease-out';
                
                // 添加成功特效
                createSuccessParticles(submitCodeButton);
            } else {
                digitInputs.forEach(input => {
                    input.value = '';
                });
                shakePuzzle(document.querySelector('.code-input'));
            }
        });
    }
}

// 辅助函数
function revealClue(puzzleElement) {
    const clue = puzzleElement.querySelector('.hidden-clue');
    if (clue) {
        clue.classList.add('revealed');
    }
}

function shakePuzzle(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

function arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function playNote(note) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    const frequencies = {
        'C': 261.63,
        'D': 293.66,
        'E': 329.63,
        'F': 349.23
    };
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[note];
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 添加成功音效
function playSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 添加错误音效
function playErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initMobileEnhancements();
    createParticles();
    
    // 添加时间轴点击事件
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // 添加信封点击事件
    const envelope = document.getElementById('envelope');
    const invitationCard = document.getElementById('invitation');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    const contentSections = document.getElementById('content-sections');
    const timelineContainer = document.getElementById('timeline-container');
    
    // 确保内容区域和时间轴初始状态为隐藏
    contentSections.classList.add('hidden');
    timelineContainer.classList.add('hidden');
    contentSections.style.opacity = '0';
    timelineContainer.style.opacity = '0';
    
    // 确保邀请函内容初始状态为隐藏
    invitationContent.style.display = 'none';
    
    envelope.addEventListener('click', function() {
        // 添加点击动画
        this.classList.add('clicked');
        
        // 显示邀请卡和密码输入界面
        invitationCard.classList.add('show');
        invitationCard.style.opacity = '1';
        invitationCard.style.visibility = 'visible';
        passwordSection.style.display = 'block';
        
        // 确保邀请函内容保持隐藏状态
        invitationContent.style.display = 'none';
        
        // 隐藏信封
        setTimeout(() => {
            this.style.display = 'none';
        }, 500);
    });
    
    // 添加触摸波纹效果
    const touchElements = document.querySelectorAll('.touch-ripple');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // 初始化剧本杀特效
    initMurderEffects();
    initEscapeRoomPuzzles();
}); 