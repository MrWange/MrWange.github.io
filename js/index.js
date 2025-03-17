// 添加鼠标移动跟踪
document.querySelector('.password-section').addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / this.offsetWidth) * 100;
    const y = ((e.clientY - rect.top) / this.offsetHeight) * 100;
    this.style.setProperty('--x', `${x}%`);
    this.style.setProperty('--y', `${y}%`);
});

// 添加输入框字符动画
document.getElementById('password-input').addEventListener('input', function(e) {
    if (this.value.length > 0) {
        this.style.letterSpacing = '8px';
    } else {
        this.style.letterSpacing = '3px';
    }
});

function checkPassword() {
    const password = document.getElementById('password-input').value;
    const passwordInput = document.getElementById('password-input');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    
    // 添加多个可用密码
    const validPasswords = ['5623', '7895', '1548', '6397', '4568'];
    
    if (validPasswords.includes(password)) {
        // 添加成功动画
        passwordInput.style.borderColor = '#4CAF50';
        passwordInput.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        
        // 淡出密码区域
        passwordSection.style.animation = 'fadeOut 0.8s ease-out forwards';
        
        // 播放成功音效（可选）
        const successSound = new Audio('./resource/游戏成功音效_耳聆网_[声音ID：13209].wav');
        successSound.play().catch(e => console.log('Audio play failed:', e));
        
        setTimeout(() => {
            // 隐藏密码区域
            passwordSection.classList.add('hidden');
            // 显示邀请函内容
            invitationContent.classList.remove('hidden');
            invitationContent.classList.add('fade-scale-in');
            
            // 依次显示内容项
            const contentItems = document.querySelectorAll('.content-item');
            contentItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, 200 * (index + 1));
            });

            // 绑定确认参加按钮事件
            bindConfirmButton();
        }, 800);
    } else {
        // 添加错误动画
        passwordInput.classList.add('shake');
        passwordInput.style.borderColor = '#ff4444';
        passwordInput.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
        
        // 播放错误音效（可选）
        const errorSound = new Audio('./resource/短提示音_耳聆网_[声音ID：22191].wav');
        errorSound.play().catch(e => console.log('Audio play failed:', e));
        
        // 显示错误提示
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

// 添加回车键支持
document.getElementById('password-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});

// 添加输入框焦点效果
document.getElementById('password-input').addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
});

document.getElementById('password-input').addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
});

// 绑定确认参加按钮事件
function bindConfirmButton() {
    const confirmButton = document.querySelector('.rsvp-button.content-item');
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            const timelineContainer = document.getElementById('timeline-container');
            const contentSections = document.getElementById('content-sections');
            const invitationCard = document.querySelector('.invitation-card');
            
            // 先显示加载指示器
            showLoadingIndicator();
            
            // 预先显示时间轴和内容区域，但设置透明度为0
            timelineContainer.classList.remove('hidden');
            contentSections.classList.remove('hidden');
            timelineContainer.style.opacity = '0';
            contentSections.style.opacity = '0';
            
            // 预加载内容
            preloadSectionContent();
            
            // 关闭邀请函
            invitationCard.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                // 隐藏邀请函
                invitationCard.style.display = 'none';
                
                // 隐藏加载指示器
                hideLoadingIndicator();
                
                // 显示时间轴和内容区域
                timelineContainer.style.opacity = '1';
                contentSections.style.opacity = '1';
                
                // 添加淡入动画
                timelineContainer.classList.add('fade-in');
                contentSections.classList.add('fade-in');
                
                // 初始化滚动监听
                initScrollListener();
                
                // 自动滚动到第一个部分
                setTimeout(() => {
                    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }, 800); // 增加延迟时间，确保内容已加载
        });
    }
}

// 添加加载指示器
function showLoadingIndicator() {
    // 检查是否已存在加载指示器
    let loadingIndicator = document.getElementById('loading-indicator');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'loading-indicator';
        
        // 添加加载动画
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="loading-text">内容加载中...</p>
        `;
        
        document.body.appendChild(loadingIndicator);
    } else {
        loadingIndicator.classList.remove('hidden', 'fade-out');
    }
    
    // 确保加载指示器可见
    loadingIndicator.style.opacity = '1';
    loadingIndicator.style.display = 'flex';
}

// 隐藏加载指示器
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

// 预加载各部分内容
function preloadSectionContent() {
    // 预加载各部分的背景图片
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        // 强制浏览器计算样式，触发背景图片加载
        window.getComputedStyle(section).background;
        
        // 预初始化各部分的特效
        const sectionId = section.id;
        if (sectionId === 'murder') {
            // 预初始化剧本杀特效
            const bloodSplatter = document.createElement('div');
            bloodSplatter.className = 'blood-splatter';
            bloodSplatter.style.opacity = '0';
            section.appendChild(bloodSplatter);
        } else if (sectionId === 'escape') {
            // 预初始化密室特效
            const modules = section.querySelectorAll('.escape-module');
            modules.forEach(module => {
                // 强制计算样式
                window.getComputedStyle(module).transform;
            });
        }
    });
}

// 初始化滚动监听
function initScrollListener() {
    const sections = document.querySelectorAll('.section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // 视差滚动效果
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxBg = document.querySelector('.parallax-bg');
        if (parallaxBg) {
            parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // 滚动处理函数 - 检查可见部分并初始化
    const handleScroll = debounce(() => {
        initVisibleSections();
    }, 100);
    
    // 监听区块可见性
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 延迟初始化特定部分的特效，提高性能
                const sectionId = entry.target.id;
                if (sectionId === 'intro' && !entry.target.dataset.initialized) {
                    setTimeout(() => initIntroInteractions(), 300);
                    entry.target.dataset.initialized = 'true';
                } else if (sectionId === 'murder' && !entry.target.dataset.initialized) {
                    setTimeout(() => initMurderInteractions(), 300);
                    entry.target.dataset.initialized = 'true';
                } else if (sectionId === 'escape' && !entry.target.dataset.initialized) {
                    setTimeout(() => {
                        initEscapeModules();
                        initEscapeEffects();
                    }, 300);
                    entry.target.dataset.initialized = 'true';
                } else if (sectionId === 'dinner' && !entry.target.dataset.initialized) {
                    setTimeout(() => initDinnerInteractions(), 300);
                    entry.target.dataset.initialized = 'true';
                } else if (sectionId === 'home' && !entry.target.dataset.initialized) {
                    setTimeout(() => initHomeInteractions(), 300);
                    entry.target.dataset.initialized = 'true';
                }
                
                // 更新时间轴激活状态
                timelineItems.forEach(item => {
                    if (item.dataset.section === sectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
    
    // 时间轴点击事件
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.section;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                // 平滑滚动到目标部分
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // 如果是剧本杀部分，确保互动特效被触发
                if (targetId === 'murder') {
                    // 等待滚动完成后初始化互动特效
                    setTimeout(() => {
                        if (!targetSection.dataset.initialized) {
                            initMurderInteractions();
                            targetSection.dataset.initialized = 'true';
                        } else {
                            // 即使已初始化，也触发一次互动效果
                            triggerMurderInteraction();
                        }
                        // 确保播放恐怖音效
                        playHorrorSound();
                    }, 800); // 给滚动留出足够时间
                }
            }
        });
    });
    
    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll);
    
    // 初始调用一次
    handleScroll();
}

// 触发剧本杀互动效果
function triggerMurderInteraction() {
    const murderSection = document.getElementById('murder');
    if (!murderSection) return;
    
    // 查找一个高亮文本或段落来触发效果
    const interactiveElement = murderSection.querySelector('.highlight') || 
                              murderSection.querySelector('p');
    
    if (interactiveElement) {
        // 创建并触发一个模拟点击事件
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        // 触发闪电效果
        const lightning = document.querySelector('.lightning');
        if (lightning) {
            lightning.style.animation = 'lightning 1.5s';
            setTimeout(() => {
                if (document.body.contains(lightning)) {
                    lightning.style.animation = '';
                }
            }, 1500);
        }
        
        // 显示随机线索
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        showRandomClue(murderSection, isMobile);
        
        // 触发点击事件
        interactiveElement.dispatchEvent(clickEvent);
    }
}

function showConfirmDialog(message, onConfirm) {
    const dialog = document.getElementById('confirmDialog');
    const dialogMessage = dialog.querySelector('.dialog-message');
    const confirmBtn = dialog.querySelector('.confirm-btn');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    
    // 设置消息
    dialogMessage.textContent = message;
    
    // 显示对话框
    dialog.classList.remove('hidden');
    dialog.classList.add('dialog-show');
    
    // 绑定按钮事件
    const handleConfirm = () => {
        dialog.classList.remove('dialog-show');
        dialog.classList.add('dialog-hide');
        setTimeout(() => {
            dialog.classList.add('hidden');
            dialog.classList.remove('dialog-hide');
            onConfirm();
        }, 300);
        cleanup();
    };
    
    const handleCancel = () => {
        dialog.classList.remove('dialog-show');
        dialog.classList.add('dialog-hide');
        setTimeout(() => {
            dialog.classList.add('hidden');
            dialog.classList.remove('dialog-hide');
        }, 300);
        cleanup();
    };
    
    const handleOutsideClick = (e) => {
        if (e.target === dialog) {
            handleCancel();
        }
    };
    
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        dialog.removeEventListener('click', handleOutsideClick);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    dialog.addEventListener('click', handleOutsideClick);
}

let lastViewState = ''; // 用于记录上一个视图状态

function closeInvitation() {
    const invitationCard = document.querySelector('.invitation-card');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    const timelineContainer = document.getElementById('timeline-container');
    const contentSections = document.getElementById('content-sections');
    const cryingMessage = document.getElementById('crying-message');
    
    // 记录当前状态
    if (!passwordSection.classList.contains('hidden')) {
        lastViewState = 'password';
    } else if (!invitationContent.classList.contains('hidden')) {
        lastViewState = 'invitation';
    } else if (!timelineContainer.classList.contains('hidden')) {
        lastViewState = 'timeline';
    }
    
    // 添加淡出动画
    invitationCard.classList.add('fade-out');
    if (timelineContainer) timelineContainer.classList.add('fade-out');
    if (contentSections) contentSections.classList.add('fade-out');
    
    setTimeout(() => {
        // 隐藏所有内容
        invitationCard.classList.add('hidden');
        if (timelineContainer) timelineContainer.classList.add('hidden');
        if (contentSections) contentSections.classList.add('hidden');
        
        // 显示哭泣提示和下雨效果
        cryingMessage.classList.remove('hidden');
        cryingMessage.classList.add('fade-scale-in');
        createRain();
    }, 500);
}

function restoreLastView() {
    const invitationCard = document.querySelector('.invitation-card');
    const cryingMessage = document.getElementById('crying-message');
    const passwordSection = document.getElementById('password-section');
    const invitationContent = document.getElementById('invitation-content');
    const timelineContainer = document.getElementById('timeline-container');
    const contentSections = document.getElementById('content-sections');
    
    // 停止下雨效果
    stopRain();
    
    // 隐藏哭泣提示
    cryingMessage.classList.add('hidden');
    
    // 重置邀请卡样式
    invitationCard.classList.remove('hidden');
    invitationCard.style.display = '';
    invitationCard.style.opacity = '0';
    invitationCard.style.transform = 'translate(-50%, -45%)';
    
    // 移除所有可能的动画类
    invitationCard.classList.remove('fade-in', 'fade-out');
    timelineContainer.classList.remove('fade-out');
    contentSections.classList.remove('fade-out');
    
    // 强制重排
    void invitationCard.offsetWidth;
    
    // 添加淡入动画
    invitationCard.classList.add('fade-in');
    
    // 根据lastViewState显示相应内容
    if (lastViewState === 'password') {
        passwordSection.classList.remove('hidden');
        invitationContent.classList.add('hidden');
        timelineContainer.classList.add('hidden');
        contentSections.classList.add('hidden');
    } else if (lastViewState === 'invitation') {
        passwordSection.classList.add('hidden');
        invitationContent.classList.remove('hidden');
        timelineContainer.classList.add('hidden');
        contentSections.classList.add('hidden');
    } else if (lastViewState === 'timeline') {
        passwordSection.classList.add('hidden');
        invitationContent.classList.add('hidden');
        timelineContainer.classList.remove('hidden');
        contentSections.classList.remove('hidden');
        
        // 恢复时间轴和内容区域的样式
        timelineContainer.style.opacity = '1';
        contentSections.style.opacity = '1';
        
        // 重新初始化滚动监听
        setTimeout(() => {
            initScrollListener();
            // 自动滚动到第一个部分
            document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// 添加ESC键关闭支持
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeInvitation();
    }
});

// 添加背景装饰元素的动画
const decorativeItems = document.querySelectorAll('.floating-item');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

// 初始化装饰元素的随机位置
decorativeItems.forEach(item => {
    item.style.left = `${Math.random() * 100}%`;
    item.style.top = `${Math.random() * 100}%`;
    item.style.transform = `translate(-50%, -50%) scale(${Math.random() * 0.5 + 0.5})`;
    
    // 添加随机动画延迟
    item.style.animationDelay = `${Math.random() * 2}s`;
});

// 监听鼠标移动
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 平滑动画
function animate() {
    // 平滑过渡到目标位置
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;

    decorativeItems.forEach(item => {
        const speed = parseFloat(item.dataset.speed);
        const rect = item.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const itemCenterY = rect.top + rect.height / 2;
        
        // 计算与鼠标的距离
        const deltaX = targetX - itemCenterX;
        const deltaY = targetY - itemCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 根据距离计算移动效果
        const moveX = (deltaX / distance) * speed * 2;
        const moveY = (deltaY / distance) * speed * 2;
        
        // 应用移动效果
        item.style.transform = `translate(
            calc(-50% + ${moveX}px), 
            calc(-50% + ${moveY}px)
            ) scale(${Math.max(0.5, 1 - distance / 1000)})
        `;
    });

    requestAnimationFrame(animate);
}

animate();

// 添加触摸设备支持
document.addEventListener('touchmove', (e) => {
    // 只在特定区域（如互动元素）阻止默认行为
    if (e.target.closest('.interactive-element')) {
        e.preventDefault();
    }
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
}, { passive: true });

// 创建雨滴效果
function createRain() {
    const rainContainer = document.getElementById('rainContainer');
    const numberOfDrops = 100; // 增加雨滴数量
    
    // 清除现有的雨滴
    rainContainer.innerHTML = '';
    
    // 创建新的雨滴
    for (let i = 0; i < numberOfDrops; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        
        // 随机位置和动画时间
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 0.5; // 加快动画速度，0.7-1.2秒
        const animationDelay = Math.random() * 3; // 0-3秒延迟
        const scale = Math.random() * 0.4 + 0.8; // 随机大小
        
        raindrop.style.left = `${left}%`;
        raindrop.style.animationDuration = `${animationDuration}s`;
        raindrop.style.animationDelay = `${animationDelay}s`;
        raindrop.style.transform = `scale(${scale})`;
        
        // 添加雨滴碰撞检测
        raindrop.addEventListener('animationend', () => {
            createWaterDrop(left);
        });
        
        rainContainer.appendChild(raindrop);
    }
    
    // 显示雨滴容器
    rainContainer.classList.add('show');
}

// 创建水珠效果
function createWaterDrop(left) {
    if (!document.getElementById('rainContainer').classList.contains('show')) return;
    
    const rainContainer = document.getElementById('rainContainer');
    const chance = Math.random();
    if (chance > 0.3) { // 增加到70%的概率产生水珠
        const waterdrop = document.createElement('div');
        waterdrop.className = 'waterdrop';
        
        // 增大水珠尺寸范围
        const size = Math.random() * 30 + 20; // 20-50px
        const offsetX = Math.random() * 60 - 30;
        const bottom = Math.random() * 40;
        
        waterdrop.style.width = `${size}px`;
        waterdrop.style.height = `${size}px`;
        waterdrop.style.left = `calc(${left}% + ${offsetX}px)`;
        waterdrop.style.bottom = `${bottom}%`;
        
        // 添加水珠轨迹
        const trail = document.createElement('div');
        trail.className = 'waterdrop-trail';
        trail.style.width = `${size/2}px`; // 增加轨迹宽度
        trail.style.height = `${Math.random() * 80 + 50}px`; // 增加轨迹长度
        trail.style.left = `calc(${left}% + ${offsetX + size/4}px)`;
        trail.style.bottom = `${bottom + size}%`;
        
        rainContainer.appendChild(waterdrop);
        rainContainer.appendChild(trail);
        
        // 延长清理时间
        setTimeout(() => {
            waterdrop.remove();
            trail.remove();
        }, 4000);
    }
}

// 停止下雨效果
function stopRain() {
    const rainContainer = document.getElementById('rainContainer');
    rainContainer.classList.remove('show');
    
    // 延迟后清除雨滴和水珠
    setTimeout(() => {
        rainContainer.innerHTML = '';
    }, 500);
}

// 添加访问次数记录和提示
function checkVisitCount() {
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount = parseInt(visitCount) + 1;
    localStorage.setItem('visitCount', visitCount);
    
    const visitMessage = document.getElementById('visitMessage');
    const visitText = visitMessage.querySelector('.visit-text');
    
    if (visitCount === 3) {
        visitText.textContent = '看来我的邀请函吸引到你了吗？';
        visitMessage.classList.remove('hidden');
        visitMessage.classList.add('fade-scale-in');
    } else if (visitCount === 5) {
        visitText.textContent = '我就知道我还是有点审美的！';
        visitMessage.classList.remove('hidden');
        visitMessage.classList.add('fade-scale-in');
    }
}

function closeVisitMessage() {
    const visitMessage = document.getElementById('visitMessage');
    visitMessage.classList.add('fade-out');
    setTimeout(() => {
        visitMessage.classList.add('hidden');
        visitMessage.classList.remove('fade-out', 'fade-scale-in');
    }, 300);
}

// 页面加载时检查访问次数
window.addEventListener('load', checkVisitCount);

// 添加剧本杀页面的互动效果
function initMurderInteractions() {
    const murderSection = document.getElementById('murder');
    if (!murderSection) return; // 如果剧本杀部分不存在，直接返回
    
    // 清除可能存在的旧元素
    const existingBloodSplatter = murderSection.querySelector('.blood-splatter');
    if (existingBloodSplatter) {
        existingBloodSplatter.remove();
    }
    
    // 移除可能存在的旧闪电效果
    const existingLightning = document.querySelector('.lightning');
    if (existingLightning) {
        existingLightning.remove();
    }
    
    const bloodSplatter = document.createElement('div');
    bloodSplatter.className = 'blood-splatter';
    murderSection.appendChild(bloodSplatter);

    // 添加闪电效果容器
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    document.body.appendChild(lightning);

    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

    // 添加证据元素
    addEvidenceItems(murderSection, isMobile);

    // 添加神秘符号
    addMysterySymbols(murderSection, isMobile);

    // 添加悬浮线索
    addFloatingClues(murderSection, isMobile);

    // 鼠标移动或触摸移动时添加血迹效果
    const handlePointerMove = (e) => {
        if (!document.body.contains(murderSection) || !document.body.contains(bloodSplatter)) return;
        
        // 降低移动设备上的触发概率，避免过多元素影响性能
        const triggerChance = isMobile ? 0.05 : 0.1;
        
        if (Math.random() < triggerChance) {
            const bloodDrop = document.createElement('div');
            bloodDrop.className = 'blood-drop';
            
            // 获取相对于section的位置
            const rect = murderSection.getBoundingClientRect();
            const x = e.type.includes('touch') ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
            const y = e.type.includes('touch') ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
            
            bloodDrop.style.left = `${x}px`;
            bloodDrop.style.top = `${y}px`;
            
            // 移动设备上使用更小的血迹
            const size = isMobile ? Math.random() * 15 + 5 : Math.random() * 20 + 10;
            bloodDrop.style.width = `${size}px`;
            bloodDrop.style.height = bloodDrop.style.width;
            
            bloodSplatter.appendChild(bloodDrop);
            
            // 3秒后移除血迹
            setTimeout(() => {
                if (document.body.contains(bloodDrop)) {
                    bloodDrop.remove();
                }
            }, 3000);
        }
    };
    
    // 移除可能存在的旧事件监听器
    murderSection.removeEventListener('mousemove', murderSection.mouseMoveHandler);
    murderSection.removeEventListener('touchmove', murderSection.touchMoveHandler);
    
    // 添加鼠标移动事件
    murderSection.addEventListener('mousemove', handlePointerMove);
    murderSection.mouseMoveHandler = handlePointerMove;
    
    // 添加触摸移动事件
    murderSection.addEventListener('touchmove', handlePointerMove, { passive: true });
    murderSection.touchMoveHandler = handlePointerMove;

    // 点击或触摸文字时触发闪电效果
    const highlights = murderSection.querySelectorAll('.highlight, p');
    highlights.forEach(element => {
        // 移除可能存在的旧事件监听器
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // 统一处理点击和触摸事件
        const handleInteraction = () => {
            if (!document.body.contains(newElement) || !document.body.contains(lightning)) return;
            
            // 播放闪电动画
            lightning.style.animation = 'lightning 1.5s';
            
            // 添加抖动效果
            newElement.style.transform = 'scale(1.05) translateY(-5px)';
            setTimeout(() => {
                if (document.body.contains(newElement)) {
                    newElement.style.transform = '';
                }
            }, 500);
            
            // 重置闪电动画
            setTimeout(() => {
                if (document.body.contains(lightning)) {
                    lightning.style.animation = '';
                }
            }, 1500);

            // 随机播放恐怖音效
            playHorrorSound();
            
            // 显示随机线索
            showRandomClue(murderSection, isMobile);
        };
        
        // 添加点击事件
        newElement.addEventListener('click', handleInteraction);
        
        // 添加触摸事件
        newElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInteraction();
        }, { passive: false });
    });
    
    // 添加清理函数
    murderSection.cleanup = function() {
        this.removeEventListener('mousemove', this.mouseMoveHandler);
        this.removeEventListener('touchmove', this.touchMoveHandler);
        const lightning = document.querySelector('.lightning');
        if (lightning) {
            lightning.remove();
        }
    };
    
    // 当部分不可见时清理资源
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && entry.target.cleanup) {
                entry.target.cleanup();
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(murderSection);
    
    // 添加心跳效果
    addHeartbeatEffect(murderSection);
    
    // 确保移动端的高亮文字可见
    ensureMurderHighlightVisibility();
}

// 添加证据元素
function addEvidenceItems(section, isMobile) {
    // 创建证据元素
    const evidenceTypes = ['fingerprint', 'magnifier', 'footprint'];
    // 移动设备上减少证据数量
    const evidenceCount = isMobile ? 3 : 5;
    
    for (let i = 0; i < evidenceCount; i++) {
        const evidence = document.createElement('div');
        evidence.className = `evidence-item ${evidenceTypes[i % evidenceTypes.length]}`;
        
        // 随机位置，但确保在可见区域内
        evidence.style.left = `${Math.random() * 70 + 15}%`;
        evidence.style.top = `${Math.random() * 70 + 15}%`;
        
        // 添加点击和触摸事件
        const handleEvidenceClick = (e) => {
            e.stopPropagation();
            showEvidenceDetail(evidence, section, isMobile);
        };
        
        evidence.addEventListener('click', handleEvidenceClick);
        evidence.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleEvidenceClick(e);
        }, { passive: false });
        
        section.appendChild(evidence);
    }
}

// 显示证据详情
function showEvidenceDetail(evidence, section, isMobile) {
    // 创建详情弹窗
    const detail = document.createElement('div');
    detail.className = 'evidence-detail';
    
    // 根据证据类型设置内容
    let content = '';
    if (evidence.classList.contains('fingerprint')) {
        content = '发现指纹痕迹！这可能是凶手留下的关键证据。';
    } else if (evidence.classList.contains('magnifier')) {
        content = '发现可疑物品！需要进一步调查。';
    } else if (evidence.classList.contains('footprint')) {
        content = '发现脚印！可以追踪嫌疑人的行动路线。';
    }
    
    detail.innerHTML = `
        <div class="evidence-content">
            <h3>发现证据</h3>
            <p>${content}</p>
            <button class="evidence-close">关闭</button>
        </div>
    `;
    
    // 设置位置，确保在移动设备上正确显示
    const rect = evidence.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    
    // 计算弹窗位置，确保不超出屏幕边界
    let leftPos = rect.left - sectionRect.left + rect.width / 2;
    let topPos = rect.top - sectionRect.top - 10;
    
    // 移动设备上调整位置，确保在屏幕内
    if (isMobile) {
        const detailWidth = 200; // 移动端弹窗宽度
        if (leftPos - detailWidth/2 < 10) {
            leftPos = detailWidth/2 + 10;
        } else if (leftPos + detailWidth/2 > sectionRect.width - 10) {
            leftPos = sectionRect.width - detailWidth/2 - 10;
        }
        
        // 确保弹窗不会太靠近顶部
        if (topPos < 50) {
            // 如果太靠近顶部，则显示在证据下方
            topPos = rect.top - sectionRect.top + rect.height + 10;
            
            // 调整箭头位置
            detail.classList.add('arrow-top');
        }
    }
    
    detail.style.left = `${leftPos}px`;
    detail.style.top = `${topPos}px`;
    
    section.appendChild(detail);
    
    // 添加关闭按钮事件
    const closeBtn = detail.querySelector('.evidence-close');
    closeBtn.addEventListener('click', () => {
        detail.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(detail)) {
                detail.remove();
            }
        }, 300);
    });
    
    // 点击其他区域关闭
    const handleOutsideClick = (e) => {
        if (!detail.contains(e.target) && e.target !== evidence) {
            detail.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(detail)) {
                    detail.remove();
                }
            }, 300);
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }, 10);
}

// 添加神秘符号
function addMysterySymbols(section, isMobile) {
    // 移动设备上减少符号数量
    const symbolCount = isMobile ? 2 : 3;
    const symbols = ['⚰️', '🔪', '💀'];
    
    for (let i = 0; i < symbolCount; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'mystery-symbol';
        symbol.textContent = symbols[i % symbols.length];
        
        // 随机位置，但避免边缘
        symbol.style.left = `${Math.random() * 60 + 20}%`;
        symbol.style.top = `${Math.random() * 60 + 20}%`;
        
        // 随机旋转
        symbol.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        
        section.appendChild(symbol);
    }
}

// 添加悬浮线索
function addFloatingClues(section, isMobile) {
    const clues = [
        '谁是凶手？',
        '寻找线索',
        '解开谜题',
        '真相只有一个',
        '注意细节'
    ];
    
    const clueContainer = document.createElement('div');
    clueContainer.className = 'floating-clues';
    
    // 移动设备上调整位置
    if (isMobile) {
        clueContainer.style.top = '5px';
        clueContainer.style.right = '5px';
    }
    
    section.appendChild(clueContainer);
    
    // 移动设备上减少线索数量
    const clueCount = isMobile ? 3 : clues.length;
    
    for (let i = 0; i < clueCount; i++) {
        const clue = document.createElement('div');
        clue.className = 'floating-clue';
        clue.textContent = clues[i];
        
        // 设置不同的动画延迟
        clue.style.animationDelay = `${i * 2}s`;
        
        clueContainer.appendChild(clue);
    }
}

// 显示随机线索
function showRandomClue(section, isMobile) {
    const clues = [
        '凶手使用了什么武器？',
        '案发时间是几点？',
        '受害者最后见到的人是谁？',
        '现场有什么异常？',
        '谁有作案动机？'
    ];
    
    // 随机选择一条线索
    const randomClue = clues[Math.floor(Math.random() * clues.length)];
    
    // 创建线索提示
    const clueHint = document.createElement('div');
    clueHint.className = 'clue-hint';
    clueHint.textContent = randomClue;
    
    // 随机位置，但确保在可见区域内
    const sectionRect = section.getBoundingClientRect();
    
    // 移动设备上调整位置和大小
    if (isMobile) {
        clueHint.style.maxWidth = '80%';
        clueHint.style.left = '50%';
        clueHint.style.top = '50%';
        clueHint.style.transform = 'translate(-50%, -50%)';
    } else {
        clueHint.style.left = `${Math.random() * 60 + 20}%`;
        clueHint.style.top = `${Math.random() * 60 + 20}%`;
    }
    
    section.appendChild(clueHint);
    
    // 3秒后移除
    setTimeout(() => {
        if (document.body.contains(clueHint)) {
            clueHint.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(clueHint)) {
                    clueHint.remove();
                }
            }, 500);
        }
    }, 3000);
}

// 确保剧本杀部分的高亮文字在移动端可见
function ensureMurderHighlightVisibility() {
    const highlights = document.querySelectorAll('#murder .highlight');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        highlights.forEach(highlight => {
            highlight.style.display = 'block';
            highlight.style.visibility = 'visible';
            highlight.style.opacity = '1';
            highlight.style.width = '100%';
            highlight.style.margin = '10px 0';
            highlight.style.padding = '15px';
            highlight.style.fontSize = '1.2em';
            highlight.style.textAlign = 'center';
        });
    }
}

// 添加心跳效果
function addHeartbeatEffect(section) {
    // 创建心跳音效
    const heartbeatSound = new Audio('./resource/转码故障音频_耳聆网_[声音ID：18742].aiff');
    
    // 创建心跳视觉效果
    const heartbeat = document.createElement('div');
    heartbeat.className = 'heartbeat-effect';
    section.appendChild(heartbeat);
    
    // 定时触发心跳效果
    let heartbeatInterval;
    
    const startHeartbeat = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        
        heartbeatInterval = setInterval(() => {
            // 检查section是否仍然可见
            if (!section.classList.contains('visible')) {
                clearInterval(heartbeatInterval);
                return;
            }
            
            // 触发心跳效果
            heartbeat.classList.add('pulse');
            setTimeout(() => {
                heartbeat.classList.remove('pulse');
            }, 500);
            
            // 播放心跳音效
            if (Math.random() < 0.3) { // 30%的概率播放音效
                heartbeatSound.currentTime = 0;
                heartbeatSound.volume = 0.2;
                heartbeatSound.play().catch(e => console.log('Audio play failed:', e));
            }
        }, 5000); // 每5秒触发一次
    };
    
    // 当section可见时开始心跳
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startHeartbeat();
            } else {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(section);
}

// 初始化密室模块拖拽功能
function initEscapeModules() {
    const modules = document.querySelectorAll('.escape-module');
    const container = document.getElementById('escapeModules');
    
    let draggedModule = null;
    let touchStartY = 0;
    let currentDraggedElement = null;
    
    modules.forEach(module => {
        // PC端拖拽
        module.addEventListener('dragstart', (e) => {
            draggedModule = module;
            module.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        module.addEventListener('dragend', () => {
            module.classList.remove('dragging');
            checkModuleOrder();
        });
        
        module.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(draggedModule);
            } else {
                container.insertBefore(draggedModule, afterElement);
            }
        });

        // 移动端触摸
        module.addEventListener('touchstart', (e) => {
            e.preventDefault();
            currentDraggedElement = module;
            touchStartY = e.touches[0].clientY;
            module.classList.add('dragging');
            
            // 添加临时样式
            module.style.position = 'relative';
            module.style.zIndex = '1000';
        }, { passive: false });

        module.addEventListener('touchmove', (e) => {
            if (!currentDraggedElement) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const afterElement = getDragAfterElement(container, touch.clientY);
            
            if (afterElement == null) {
                container.appendChild(currentDraggedElement);
            } else {
                container.insertBefore(currentDraggedElement, afterElement);
            }
        }, { passive: false });

        module.addEventListener('touchend', (e) => {
            if (!currentDraggedElement) return;
            
            currentDraggedElement.classList.remove('dragging');
            currentDraggedElement.style.position = '';
            currentDraggedElement.style.zIndex = '';
            currentDraggedElement = null;
            
            checkModuleOrder();
        });
    });
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.escape-module:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    function checkModuleOrder() {
        const currentOrder = [...container.children].map(module => 
            parseInt(module.dataset.order)
        );
        
        // 检查是否是正确顺序且之前没有触发过
        if (JSON.stringify(currentOrder) === '[3,4,2,1]' && !localStorage.getItem('escapeSecretFound')) {
            showConfirmDialog('看来你发现了这个小秘密了！', () => {
                // 记录彩蛋已被发现
                localStorage.setItem('escapeSecretFound', 'true');
            });
        }
    }
}

// 添加美食时光互动效果
function initDinnerInteractions() {
    const dinnerSection = document.getElementById('dinner');
    if (!dinnerSection) return; // 如果美食时光部分不存在，直接返回
    
    const foodEmojis = ['🍜', '🍖', '🍗', '🍕', '🍣', '🍱', '🍲', '🍛', '🥘', '🥗'];
    const isMobile = 'ontouchstart' in window;
    
    // 触摸和鼠标移动的统一处理
    function handlePointerMove(e) {
        if (!document.body.contains(dinnerSection)) return;
        
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        if (Math.random() < (isMobile ? 0.2 : 0.1)) { // 移动端提高触发概率
            const rect = dinnerSection.getBoundingClientRect();
            const particle = createFoodParticle(x - rect.left, y - rect.top);
            dinnerSection.appendChild(particle);
        }
    }
    
    // 创建食物粒子
    function createFoodParticle(x, y) {
        if (!document.body.contains(dinnerSection)) return null;
        
        const particle = document.createElement('div');
        particle.className = 'food-particle';
        particle.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = isMobile ? 50 + Math.random() * 50 : 100 + Math.random() * 100;
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        const rotate = -180 + Math.random() * 360;
        
        particle.style.setProperty('--moveX', `${moveX}px`);
        particle.style.setProperty('--moveY', `${moveY}px`);
        particle.style.setProperty('--rotate', `${rotate}deg`);
        
        particle.addEventListener('animationend', () => {
            if (document.body.contains(particle)) {
                particle.remove();
            }
        });
        return particle;
    }
    
    // 创建触摸涟漪效果
    function createTouchRipple(element, x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        
        const rect = element.getBoundingClientRect();
        ripple.style.left = `${x - rect.left}px`;
        ripple.style.top = `${y - rect.top}px`;
        
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    }
    
    // 处理点击/触摸事件
    function handleInteraction(e, element) {
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // 创建涟漪效果
        createTouchRipple(element, x, y);
        
        // 创建食物emoji爆炸效果
        const particleCount = isMobile ? 6 : 8; // 移动端减少粒子数量
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = isMobile ? 60 : 100;
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;
            
            const emoji = createFoodParticle(
                x - element.getBoundingClientRect().left,
                y - element.getBoundingClientRect().top
            );
            element.appendChild(emoji);
        }
        
        // 更新触摸位置变量
        element.style.setProperty('--touch-x', `${x - element.getBoundingClientRect().left}px`);
        element.style.setProperty('--touch-y', `${y - element.getBoundingClientRect().top}px`);
    }
    
    // 绑定事件监听器
    if (isMobile) {
        dinnerSection.addEventListener('touchmove', handlePointerMove, { passive: true });
        dinnerSection.querySelectorAll('p').forEach(p => {
            p.addEventListener('touchstart', e => {
                e.preventDefault();
                handleInteraction(e, p);
            });
        });
    } else {
        dinnerSection.addEventListener('mousemove', handlePointerMove);
        dinnerSection.querySelectorAll('p').forEach(p => {
            p.addEventListener('click', e => handleInteraction(e, p));
        });
    }
}

// 初始化前言部分的互动特效
function initIntroInteractions() {
    const introSection = document.getElementById('intro');
    if (!introSection) return;
    
    // 添加装饰元素
    addDecorativeElements(introSection);
    
    // 添加鼠标跟踪效果
    introSection.addEventListener('mousemove', handleIntroMouseMove);
    
    // 添加段落点击效果
    const paragraphs = introSection.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.addEventListener('click', (e) => createParagraphClickEffect(e, p));
    });
    
    // 添加标题悬停效果
    const title = introSection.querySelector('.section-title');
    if (title) {
        title.addEventListener('mouseenter', () => {
            createTitleHoverEffect(title);
        });
    }
}

// 添加装饰元素
function addDecorativeElements(section) {
    // 添加气泡
    for (let i = 0; i < 12; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = Math.random() * 60 + 20; // 20-80px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // 随机动画延迟
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        
        section.appendChild(bubble);
    }
    
    // 添加星星
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 15 + 5; // 5-20px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // 随机动画延迟
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        section.appendChild(star);
    }
    
    // 添加彩带
    for (let i = 0; i < 8; i++) {
        const ribbon = document.createElement('div');
        ribbon.className = 'ribbon';
        
        const width = Math.random() * 200 + 100; // 100-300px
        ribbon.style.width = `${width}px`;
        
        ribbon.style.left = `${Math.random() * 100}%`;
        ribbon.style.top = `${Math.random() * 100}%`;
        ribbon.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // 随机动画延迟
        ribbon.style.animationDelay = `${Math.random() * 3}s`;
        
        section.appendChild(ribbon);
    }
}

// 处理鼠标移动效果
function handleIntroMouseMove(e) {
    const section = e.currentTarget;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 更新CSS变量用于光晕效果
    section.style.setProperty('--mouse-x', `${x}px`);
    section.style.setProperty('--mouse-y', `${y}px`);
    
    // 移动装饰元素
    const bubbles = section.querySelectorAll('.bubble');
    const stars = section.querySelectorAll('.star');
    const ribbons = section.querySelectorAll('.ribbon');
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (x - centerX) / 30;
    const moveY = (y - centerY) / 30;
    
    bubbles.forEach((bubble, index) => {
        const factor = (index % 3 + 1) * 0.2;
        bubble.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px) scale(${1 + factor * 0.1})`;
    });
    
    stars.forEach((star, index) => {
        const factor = (index % 4 + 1) * 0.15;
        star.style.transform = `translate(${-moveX * factor}px, ${-moveY * factor}px) scale(${1 + factor * 0.1}) rotate(${moveX + moveY}deg)`;
    });
    
    ribbons.forEach((ribbon, index) => {
        const factor = (index % 3 + 1) * 0.1;
        ribbon.style.transform = `rotate(${ribbon.dataset.rotation || 0}deg) scaleX(${1 + factor * Math.abs(moveX) / 100})`;
    });
}

// 创建段落点击效果
function createParagraphClickEffect(e, paragraph) {
    // 创建波纹效果
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'radial-gradient(circle, rgba(255,105,180,0.6) 0%, transparent 70%)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'ripple 1s ease-out forwards';
    
    const rect = paragraph.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    paragraph.appendChild(ripple);
    
    // 创建闪光效果
    paragraph.style.boxShadow = '0 0 20px rgba(255,105,180,0.5)';
    paragraph.style.transform = 'scale(1.05)';
    
    // 创建漂浮文字效果
    const text = paragraph.textContent;
    const words = text.split(' ');
    
    if (words.length > 3) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (randomWord.length > 2) {
            const floatingText = document.createElement('div');
            floatingText.textContent = randomWord;
            floatingText.style.position = 'absolute';
            floatingText.style.left = `${x}px`;
            floatingText.style.top = `${y}px`;
            floatingText.style.color = '#FF69B4';
            floatingText.style.fontWeight = 'bold';
            floatingText.style.pointerEvents = 'none';
            floatingText.style.animation = 'float-text 2s forwards';
            floatingText.style.zIndex = '10';
            
            paragraph.appendChild(floatingText);
            
            setTimeout(() => {
                if (document.body.contains(floatingText)) {
                    floatingText.remove();
                }
            }, 2000);
        }
    }
    
    // 重置样式
    setTimeout(() => {
        paragraph.style.boxShadow = '';
        paragraph.style.transform = '';
        
        if (document.body.contains(ripple)) {
            ripple.remove();
        }
    }, 1000);
}

// 创建标题悬停效果
function createTitleHoverEffect(title) {
    // 创建闪光效果
    const glow = document.createElement('div');
    glow.style.position = 'absolute';
    glow.style.top = '0';
    glow.style.left = '0';
    glow.style.right = '0';
    glow.style.bottom = '0';
    glow.style.background = 'radial-gradient(circle at center, rgba(255,105,180,0.3) 0%, transparent 70%)';
    glow.style.borderRadius = '50%';
    glow.style.filter = 'blur(10px)';
    glow.style.animation = 'pulse 1s ease-in-out';
    glow.style.pointerEvents = 'none';
    
    title.appendChild(glow);
    
    // 创建星星爆炸效果
    for (let i = 0; i < 10; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 10 + 5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        const angle = (i / 10) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        star.style.position = 'absolute';
        star.style.left = '50%';
        star.style.top = '50%';
        star.style.transform = 'translate(-50%, -50%)';
        star.style.animation = `star-explode 1s forwards`;
        star.style.animationDelay = `${Math.random() * 0.2}s`;
        
        star.style.setProperty('--target-x', `${x}px`);
        star.style.setProperty('--target-y', `${y}px`);
        
        title.appendChild(star);
    }
    
    // 清理效果
    setTimeout(() => {
        if (document.body.contains(glow)) {
            glow.remove();
        }
        
        const stars = title.querySelectorAll('.star');
        stars.forEach(star => {
            if (document.body.contains(star)) {
                star.remove();
            }
        });
    }, 1500);
}

// 初始化回家部分的互动特效
function initHomeInteractions() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    // 确保highlight文字可见
    ensureHighlightVisibility();
    
    // 添加触摸反馈效果
    const paragraphs = homeSection.querySelectorAll('.section-content p');
    paragraphs.forEach(p => {
        p.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / this.offsetWidth) * 100;
            const y = ((touch.clientY - rect.top) / this.offsetHeight) * 100;
            this.style.setProperty('--touch-x', `${x}%`);
            this.style.setProperty('--touch-y', `${y}%`);
        }, { passive: true });
        
        // 添加鼠标移动效果
        p.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / this.offsetWidth) * 100;
            const y = ((e.clientY - rect.top) / this.offsetHeight) * 100;
            this.style.setProperty('--touch-x', `${x}%`);
            this.style.setProperty('--touch-y', `${y}%`);
        });
    });
    
    // 创建星空效果
    createStarryBackground(homeSection);
    
    // 创建流星效果
    setInterval(() => {
        if (Math.random() > 0.7 && homeSection.classList.contains('visible')) {
            createShootingStar(homeSection);
        }
    }, 2000);
    
    // 添加highlight文字动画效果
    const highlight = homeSection.querySelector('.highlight');
    if (highlight) {
        highlight.addEventListener('click', function() {
            this.classList.add('pulse-effect');
            setTimeout(() => {
                this.classList.remove('pulse-effect');
            }, 1000);
        });
    }
}

// 创建星空背景
function createStarryBackground(container) {
    const starContainer = document.createElement('div');
    starContainer.className = 'star-container';
    
    // 创建50-100颗星星
    const starCount = Math.floor(Math.random() * 50) + 50;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机位置
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // 随机大小
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机动画延迟
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starContainer.appendChild(star);
    }
    
    container.appendChild(starContainer);
}

// 创建流星效果
function createShootingStar(container) {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    
    // 随机位置和角度
    shootingStar.style.left = `${Math.random() * 70}%`;
    shootingStar.style.top = `${Math.random() * 30}%`;
    shootingStar.style.transform = `rotate(${Math.random() * 20 + 35}deg)`;
    
    // 随机大小
    const width = Math.random() * 50 + 50;
    shootingStar.style.width = `${width}px`;
    
    // 随机动画持续时间
    const duration = Math.random() * 2 + 1;
    shootingStar.style.animationDuration = `${duration}s`;
    
    container.appendChild(shootingStar);
    
    // 动画结束后移除
    setTimeout(() => {
        if (shootingStar.parentNode === container) {
            container.removeChild(shootingStar);
        }
    }, duration * 1000);
}

// 初始化照片墙交互效果
function enhancePhotoWall() {
    const photoFrames = document.querySelectorAll('.photo-frame');
    photoFrames.forEach(frame => {
        // 添加3D悬停效果
        frame.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 10;
            const angleY = (centerX - x) / 10;
            
            this.style.transform = `perspective(300px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.1)`;
        });
        
        frame.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(300px) rotateX(0) rotateY(0) scale(1)';
        });
        
        // 添加点击波纹效果
        frame.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size * 2}px`;
            
            const x = e.clientX - rect.left - size;
            const y = e.clientY - rect.top - size;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode === this) {
                    this.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// 在页面加载完成后初始化所有互动效果
window.addEventListener('load', function() {
    // 初始化滚动监听
    initScrollObserver();
    
    // 自动滚动到第一个部分
    setTimeout(() => {
        const firstSection = document.querySelector('.section');
        if (firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 500);
    
    // 预加载所有内容
    preloadAllContent();
    
    // 初始化当前可见的部分
    initVisibleSections();
    
    // 初始化前言部分特效（因为它通常是首先可见的）
    if (document.getElementById('intro')) {
        initIntroInteractions();
    }
    
    // 初始化home部分特效
    if (document.getElementById('home')) {
        initHomeInteractions();
    }
    
    // 增强照片墙交互效果
    enhancePhotoWall();
    
    // 确保highlight文字在移动端可见
    ensureHighlightVisibility();
    
    // 特别处理前言和回家部分的highlight文字
    fixIntroAndHomeHighlights();
    
    // 初始化移动端增强效果
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        initMobileEnhancements();
    }

    
    // 增强各部分的互动性
    enhanceAllSectionsInteractivity();
    
    // 添加CSS动画样式
    addAnimationStyles();
});

// 添加CSS动画样式
function addAnimationStyles() {
    // 检查是否已添加样式
    if (!document.getElementById('animation-styles')) {
        // 创建样式元素
        const style = document.createElement('style');
        style.id = 'animation-styles';
        
        // 添加动画样式
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes float {
                0% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0); }
            }
            
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes scale {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        
        // 添加到文档头部
        document.head.appendChild(style);
    }
}

// 初始化移动端增强效果
function initMobileEnhancements() {
    // 添加触摸波纹效果
    addTouchRippleEffect();
    
    // 添加3D触摸效果
    add3DTouchEffect();
    
    // 增强标题动画效果
    enhanceTitleAnimations();
    
    // 增强吃饭部分的交互效果
    enhanceDinnerInteraction();
}

// 增强吃饭部分的交互效果
function enhanceDinnerInteraction() {
    if (!document.getElementById('dinner')) return;
    
    const dinnerSection = document.getElementById('dinner');
    const dinnerItems = dinnerSection.querySelectorAll('p');
    
    // 为每个项目添加点击效果
    dinnerItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            // 添加脉冲效果
            this.classList.add('pulse-effect');
            
            // 移除之前的高亮
            dinnerItems.forEach(i => {
                if (i !== this) i.classList.remove('dinner-item-active');
            });
            
            // 添加高亮
            this.classList.add('dinner-item-active');
            
            // 移除脉冲效果
            setTimeout(() => {
                this.classList.remove('pulse-effect');
            }, 1000);
            
            // 创建食物表情符号粒子
            createFoodEmojis(this, 5);
        });
    });
}

// 创建食物表情符号粒子
function createFoodEmojis(element, count) {
    const foodEmojis = ['🍕', '🍔', '🍟', '🍗', '🍖', '🍝', '🍜', '🍲', '🍱', '🍣', '🍤', '🍥', '🍡', '🍦', '🍧', '🍨', '🍩', '🍪', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🥑', '🥒', '🥕', '🌽', '🌶️', '🥔'];
    
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.className = 'food-particle';
            emoji.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
            
            // 随机位置
            const x = rect.left + rect.width * Math.random();
            const y = rect.top + rect.height * Math.random();
            
            // 随机移动方向
            const moveX = (Math.random() - 0.5) * 100;
            const moveY = (Math.random() - 0.5) * 100;
            const rotate = (Math.random() - 0.5) * 720;
            
            emoji.style.setProperty('--moveX', `${moveX}px`);
            emoji.style.setProperty('--moveY', `${moveY}px`);
            emoji.style.setProperty('--rotate', `${rotate}deg`);
            
            emoji.style.left = `${x}px`;
            emoji.style.top = `${y}px`;
            
            document.body.appendChild(emoji);
            
            // 动画结束后移除
            setTimeout(() => {
                if (document.body.contains(emoji)) {
                    document.body.removeChild(emoji);
                }
            }, 1000);
        }, i * 100);
    }
}

// 添加触摸波纹效果
function addTouchRippleEffect() {
    // 为所有可交互元素添加触摸波纹效果
    const interactiveElements = document.querySelectorAll('p, .highlight, button, .photo-frame, .escape-module');
    
    interactiveElements.forEach(element => {
        // 移除可能存在的旧事件监听器
        element.removeEventListener('touchstart', element._touchRippleHandler);
        
        // 添加新的事件监听器
        element._touchRippleHandler = function(e) {
            // 获取触摸位置
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 创建波纹元素
            const ripple = document.createElement('div');
            ripple.className = 'touch-ripple';
            
            // 设置波纹大小和位置
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.marginLeft = ripple.style.marginTop = `-${size/2}px`;
            
            // 添加到元素中
            this.appendChild(ripple);
            
            // 动画结束后移除波纹
            ripple.addEventListener('animationend', () => {
                if (ripple.parentNode === this) {
                    this.removeChild(ripple);
                }
            });
            
            // 添加触摸反馈
            addTouchFeedback(this, x, y);
        };
        
        element.addEventListener('touchstart', element._touchRippleHandler, { passive: true });
        
        // 添加鼠标点击效果（兼容PC）
        element.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 创建波纹元素
            const ripple = document.createElement('div');
            ripple.className = 'touch-ripple';
            
            // 设置波纹大小和位置
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.marginLeft = ripple.style.marginTop = `-${size/2}px`;
            
            // 添加到元素中
            this.appendChild(ripple);
            
            // 动画结束后移除波纹
            ripple.addEventListener('animationend', () => {
                if (ripple.parentNode === this) {
                    this.removeChild(ripple);
                }
            });
            
            // 添加触摸反馈
            addTouchFeedback(this, x, y);
        });
    });
}

// 添加触摸反馈效果
function addTouchFeedback(element, x, y) {
    // 设置触摸位置变量
    element.style.setProperty('--touch-x', `${x}px`);
    element.style.setProperty('--touch-y', `${y}px`);
    
    // 检查是否已有触摸反馈元素
    let feedback = element.querySelector('.touch-feedback');
    
    if (!feedback) {
        // 创建触摸反馈元素
        feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        element.appendChild(feedback);
    }
    
    // 激活触摸反馈
    feedback.classList.add('active');
    
    // 动画结束后移除激活状态
    setTimeout(() => {
        feedback.classList.remove('active');
    }, 500);
    
    // 添加脉冲效果
    element.classList.add('pulse-effect');
    
    // 移除脉冲效果
    setTimeout(() => {
        element.classList.remove('pulse-effect');
    }, 1000);
}

// 增强各部分的互动性
function enhanceAllSectionsInteractivity() {
    // 获取所有部分
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        // 为每个部分添加触摸位置跟踪
        section.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / this.offsetWidth) * 100;
            const y = ((touch.clientY - rect.top) / this.offsetHeight) * 100;
            this.style.setProperty('--touch-x', `${x}%`);
            this.style.setProperty('--touch-y', `${y}%`);
        }, { passive: true });
        
        // 添加鼠标移动跟踪（兼容PC）
        section.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / this.offsetWidth) * 100;
            const y = ((e.clientY - rect.top) / this.offsetHeight) * 100;
            this.style.setProperty('--touch-x', `${x}%`);
            this.style.setProperty('--touch-y', `${y}%`);
        });
        
        // 增强部分内的互动元素
        enhanceSectionInteractiveElements(section);
    });
}

// 增强部分内的互动元素
function enhanceSectionInteractiveElements(section) {
    // 获取部分内的所有段落
    const paragraphs = section.querySelectorAll('p');
    
    paragraphs.forEach(p => {
        // 添加悬停效果
        p.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
        
        p.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // 添加点击效果
        p.addEventListener('click', function(e) {
            // 创建闪光效果
            const glow = document.createElement('div');
            glow.style.position = 'absolute';
            glow.style.top = '0';
            glow.style.left = '0';
            glow.style.width = '100%';
            glow.style.height = '100%';
            glow.style.borderRadius = 'inherit';
            glow.style.background = 'radial-gradient(circle at var(--touch-x, 50%) var(--touch-y, 50%), rgba(255, 255, 255, 0.8) 0%, transparent 70%)';
            glow.style.opacity = '0';
            glow.style.animation = 'fadeIn 0.3s ease-out forwards, fadeOut 0.5s ease-in 0.3s forwards';
            glow.style.pointerEvents = 'none';
            glow.style.zIndex = '1';
            
            this.appendChild(glow);
            
            // 动画结束后移除闪光
            setTimeout(() => {
                if (glow.parentNode === this) {
                    this.removeChild(glow);
                }
            }, 800);
        });
    });
    
    // 获取部分内的所有高亮文本
    const highlights = section.querySelectorAll('.highlight');
    
    highlights.forEach(highlight => {
        // 添加脉冲动画
        highlight.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
            
            // 动画结束后移除
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
}

// 添加3D触摸效果
function add3DTouchEffect() {
    // 为所有内容块添加3D触摸效果
    const contentBlocks = document.querySelectorAll('.section-content p, .highlight, .photo-frame, .escape-module');
    
    contentBlocks.forEach(block => {
        // 添加3D触摸类
        block.classList.add('touch-3d');
        
        // 移除可能存在的旧事件监听器
        block.removeEventListener('touchmove', block._handle3DTouchMove);
        block.removeEventListener('touchstart', block._handle3DTouchStart);
        block.removeEventListener('touchend', block._resetTilt);
        
        // 添加触摸移动事件
        block._handle3DTouchMove = function(e) {
            // 获取触摸位置
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            
            // 计算触摸位置相对于元素中心的偏移
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 计算倾斜角度（最大10度）
            const tiltX = ((y - centerY) / centerY) * 10;
            const tiltY = ((centerX - x) / centerX) * 10;
            
            // 应用3D变换
            this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
            
            // 添加光影效果
            this.style.boxShadow = `
                0 10px 20px rgba(0, 0, 0, 0.2),
                ${tiltY * 0.5}px ${tiltX * 0.5}px 15px rgba(255, 255, 255, 0.2)
            `;
        };
        
        block._handle3DTouchStart = block._handle3DTouchMove;
        
        block._resetTilt = function() {
            // 重置变换和阴影
            this.style.transform = '';
            this.style.boxShadow = '';
            
            // 添加过渡效果使重置更平滑
            this.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
            
            // 移除过渡效果
            setTimeout(() => {
                this.style.transition = '';
            }, 500);
        };
        
        block.addEventListener('touchmove', block._handle3DTouchMove, { passive: true });
        block.addEventListener('touchstart', block._handle3DTouchStart, { passive: true });
        block.addEventListener('touchend', block._resetTilt, { passive: true });
    });
}

// 增强标题动画效果
function enhanceTitleAnimations() {
    const sectionTitles = document.querySelectorAll('.section-title');
    
    // 添加粒子飞行动画样式
    if (!document.getElementById('mobile-enhancement-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-enhancement-styles';
        style.textContent = `
            @keyframes titleGlow {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            
            @keyframes particleFly {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--end-x), var(--end-y)) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes buttonGlow {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 0.5; }
                100% { opacity: 0; transform: scale(1.5); }
            }
            
            @keyframes pageTransition {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    sectionTitles.forEach(title => {
        // 检查是否已经添加了闪光效果
        if (!title.querySelector('.title-glow')) {
            // 为每个标题添加闪光效果
            const glow = document.createElement('div');
            glow.className = 'title-glow';
            glow.style.position = 'absolute';
            glow.style.top = '0';
            glow.style.left = '0';
            glow.style.width = '100%';
            glow.style.height = '100%';
            glow.style.background = 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)';
            glow.style.transform = 'translateX(-100%)';
            glow.style.animation = 'titleGlow 3s ease-in-out infinite';
            glow.style.pointerEvents = 'none';
            glow.style.zIndex = '-1';
            
            title.style.position = 'relative';
            title.style.overflow = 'hidden';
            title.appendChild(glow);
            
            // 移除可能存在的旧事件监听器
            title.removeEventListener('click', title._titleClickHandler);
            
            // 添加标题点击效果
            title._titleClickHandler = function(e) {
                // 创建爆炸效果
                for (let i = 0; i < 10; i++) {
                    createTitleParticle(e, this);
                }
            };
            
            title.addEventListener('click', title._titleClickHandler);
        }
    });
    
    // 创建标题粒子效果
    function createTitleParticle(e, title) {
        const particle = document.createElement('div');
        particle.className = 'title-particle';
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = 'rgba(255, 255, 255, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        // 随机位置和方向
        const rect = title.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 1 + 0.5;
        
        // 设置动画
        particle.style.animation = `particleFly ${duration}s ease-out forwards`;
        particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}px`);
        
        title.appendChild(particle);
        
        // 动画结束后移除粒子
        setTimeout(() => {
            if (particle.parentNode === title) {
                title.removeChild(particle);
            }
        }, duration * 1000);
    }
}

// 增强按钮触摸效果
function enhanceButtonEffects() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        // 移除可能存在的旧事件监听器
        button.removeEventListener('touchstart', button._buttonTouchStartHandler);
        button.removeEventListener('touchend', button._buttonTouchEndHandler);
        
        // 添加触摸开始事件
        button._buttonTouchStartHandler = function(e) {
            // 添加按下效果
            this.style.transform = 'scale(0.95)';
            this.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.2)';
            
            // 添加光晕效果
            const glow = document.createElement('div');
            glow.className = 'button-glow';
            glow.style.position = 'absolute';
            glow.style.top = '0';
            glow.style.left = '0';
            glow.style.width = '100%';
            glow.style.height = '100%';
            glow.style.borderRadius = 'inherit';
            glow.style.background = 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%)';
            glow.style.opacity = '0';
            glow.style.animation = 'buttonGlow 0.5s ease-out forwards';
            glow.style.pointerEvents = 'none';
            
            this.appendChild(glow);
            
            // 动画结束后移除光晕
            setTimeout(() => {
                if (glow.parentNode === this) {
                    this.removeChild(glow);
                }
            }, 500);
        };
        
        // 添加触摸结束事件
        button._buttonTouchEndHandler = function() {
            // 恢复按钮样式
            this.style.transform = '';
            this.style.boxShadow = '';
        };
        
        button.addEventListener('touchstart', button._buttonTouchStartHandler, { passive: true });
        button.addEventListener('touchend', button._buttonTouchEndHandler, { passive: true });
    });
}

// 添加页面切换动画
function addPageTransitionEffects() {
    const sections = document.querySelectorAll('.section');
    
    // 为每个部分添加进入视图时的动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 为部分内的所有元素添加动画
                const elements = entry.target.querySelectorAll('.section-title, .section-content p, .highlight');
                elements.forEach((element, index) => {
                    // 设置初始状态
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    
                    // 添加动画
                    setTimeout(() => {
                        element.style.animation = 'pageTransition 0.5s ease-out forwards';
                        // 动画结束后清除样式
                        setTimeout(() => {
                            element.style.opacity = '';
                            element.style.transform = '';
                        }, 500);
                    }, index * 100); // 错开动画开始时间
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
}

// 在页面加载完成后初始化移动端增强效果
window.addEventListener('load', function() {
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        initMobileEnhancements();
    }
});

// 预加载所有内容
function preloadAllContent() {
    // 预加载背景图片
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        // 强制浏览器计算样式，触发背景图片加载
        window.getComputedStyle(section).background;
    });
    
    // 预加载其他资源
    const images = [
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// 初始化当前可见的部分
function initVisibleSections() {
    const visibleSections = Array.from(document.querySelectorAll('.section'))
        .filter(section => {
            const rect = section.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });
    
    // 检查是否有剧本杀部分可见
    const murderSectionVisible = visibleSections.some(section => section.id === 'murder');
    
    // 如果剧本杀部分可见，播放恐怖音效；否则停止
    if (murderSectionVisible) {
        if (!window.currentHorrorSound) {
            playHorrorSound();
        }
    } else {
        stopHorrorSound();
    }
    
    if (visibleSections.length > 0) {
        visibleSections.forEach(section => {
            const sectionId = section.id;
            if (sectionId === 'murder' && !section.dataset.initialized) {
                initMurderInteractions();
                section.dataset.initialized = 'true';
            } else if (sectionId === 'escape' && !section.dataset.initialized) {
                initEscapeModules();
                initEscapeEffects();
                section.dataset.initialized = 'true';
            } else if (sectionId === 'dinner' && !section.dataset.initialized) {
                initDinnerInteractions();
                section.dataset.initialized = 'true';
            } else if (sectionId === 'home' && !section.dataset.initialized) {
                initHomeInteractions();
                section.dataset.initialized = 'true';
            }
        });
    }
}

// 添加密室特效
function initEscapeEffects() {
    const escapeSection = document.getElementById('escape');
    if (!escapeSection) return; // 如果密室部分不存在，直接返回
    
    const escapeModules = document.querySelectorAll('.escape-module');
    if (!escapeModules.length) return; // 如果没有模块，直接返回
    
    // 创建数字雨效果
    function createMatrixRain() {
        const characters = '01';
        const rainContainer = document.createElement('div');
        rainContainer.style.position = 'absolute';
        rainContainer.style.top = '0';
        rainContainer.style.left = '0';
        rainContainer.style.width = '100%';
        rainContainer.style.height = '100%';
        rainContainer.style.pointerEvents = 'none';
        rainContainer.style.zIndex = '0';
        escapeSection.appendChild(rainContainer);

        function createRainDrop() {
            // 检查密室部分和雨滴容器是否仍然存在
            if (!document.body.contains(escapeSection) || !document.body.contains(rainContainer)) return;
            
            const raindrop = document.createElement('div');
            raindrop.className = 'matrix-rain';
            raindrop.style.left = Math.random() * 100 + '%';
            
            // 生成更长的数字串
            const length = Math.floor(Math.random() * 30) + 20; // 20-50个字符
            raindrop.textContent = Array.from({length}, 
                () => characters[Math.floor(Math.random() * characters.length)]).join('');
            
            rainContainer.appendChild(raindrop);
            
            // 动画结束后移除元素
            raindrop.addEventListener('animationend', () => {
                if (document.body.contains(raindrop)) {
                    raindrop.remove();
                }
            });
        }

        // 更频繁地创建雨滴
        const rainInterval = setInterval(() => {
            // 检查密室部分是否仍然存在
            if (!document.body.contains(escapeSection)) {
                clearInterval(rainInterval);
                return;
            }
            createRainDrop();
        }, 100);
        
        // 初始创建多个雨滴
        for(let i = 0; i < 20; i++) {
            setTimeout(createRainDrop, i * 100);
        }
    }

    // 添加鼠标跟踪效果
    escapeModules.forEach(module => {
        module.addEventListener('mousemove', (e) => {
            // 检查模块是否仍然存在
            if (!document.body.contains(module)) return;
            
            const rect = module.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / module.offsetWidth) * 100;
            const y = ((e.clientY - rect.top) / module.offsetHeight) * 100;
            module.style.setProperty('--x', `${x}%`);
            module.style.setProperty('--y', `${y}%`);
        });
    });

    // 初始化数字雨效果
    createMatrixRain();
}

// 添加信封点击事件
if (document.getElementById('envelope')) {
    document.getElementById('envelope').addEventListener('click', function() {
        // 添加打开动画类
        this.classList.add('open');
        
        // 延迟显示邀请函，给信封足够的消失时间
        setTimeout(() => {
            const invitation = document.getElementById('invitation');
            if (invitation) {
                invitation.classList.add('show');
            }
        }, 1000);
        
        // 添加打开音效
        const openSound = new Audio('./resource/纸颤振_耳聆网_[声音ID：10931].wav');
        openSound.volume = 0.3;
        openSound.play().catch(e => console.log('Audio play failed:', e));
        
        // 0.5秒后停止音效
        setTimeout(() => {
            openSound.pause();
            openSound.currentTime = 0;
            document.getElementById('envelope').style.display = 'none';
        }, 500);
    });
}

// 创建照片墙效果
function createPhotoWall(section) {
    const photoWall = document.createElement('div');
    photoWall.className = 'photo-wall';
    photoWall.style.position = 'absolute';
    photoWall.style.bottom = '20px';
    photoWall.style.left = '50%';
    photoWall.style.transform = 'translateX(-50%)';
    photoWall.style.display = 'flex';
    photoWall.style.justifyContent = 'center';
    photoWall.style.flexWrap = 'wrap';
    photoWall.style.maxWidth = '600px';
    photoWall.style.gap = '10px';
    photoWall.style.zIndex = '3';
    
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        photoWall.style.maxWidth = '100%';
        photoWall.style.width = 'calc(100% - 20px)';
        photoWall.style.overflowX = 'auto';
        photoWall.style.flexWrap = 'nowrap';
        photoWall.style.justifyContent = 'flex-start';
        photoWall.style.paddingLeft = '5px';
        photoWall.style.paddingRight = '5px';
        photoWall.style.paddingBottom = '5px';
        photoWall.style.gap = '4px';
        photoWall.style.scrollbarWidth = 'none'; // Firefox
        photoWall.style.msOverflowStyle = 'none'; // IE
    }
    
    // 添加滚动条隐藏样式
    const style = document.createElement('style');
    style.textContent = '.photo-wall::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
    
    // 照片框架
    const photoFrames = [
        { emoji: '🎂', label: '生日蛋糕' },
        { emoji: '🎭', label: '剧本杀' },
        { emoji: '🍽️', label: '美食时光' },
        { emoji: '🔍', label: '密室逃脱' },
        { emoji: '🎁', label: '礼物时刻' },
        { emoji: '🎉', label: '欢乐瞬间' }
    ];
    
    photoFrames.forEach(frame => {
        const photo = document.createElement('div');
        photo.className = 'photo-frame';
        
        // 移动端尺寸更小，确保一行能显示6个
        if (isMobile) {
            photo.style.width = '45px';
            photo.style.height = '45px';
            photo.style.flexShrink = '0';
            photo.style.flexGrow = '0';
            photo.style.margin = '0 2px';
        } else {
            photo.style.width = '80px';
            photo.style.height = '80px';
        }
        
        photo.style.background = 'rgba(255, 255, 255, 0.1)';
        photo.style.backdropFilter = 'blur(5px)';
        photo.style.borderRadius = '10px';
        photo.style.display = 'flex';
        photo.style.flexDirection = 'column';
        photo.style.justifyContent = 'center';
        photo.style.alignItems = 'center';
        photo.style.cursor = 'pointer';
        photo.style.transition = 'all 0.3s ease';
        photo.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg)';
        photo.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        photo.style.flexShrink = '0'; // 防止在flex容器中被压缩
        
        const emoji = document.createElement('div');
        emoji.textContent = frame.emoji;
        emoji.style.fontSize = isMobile ? '1.2em' : '2em';
        emoji.style.marginBottom = isMobile ? '2px' : '5px';
        
        const label = document.createElement('div');
        label.textContent = frame.label;
        label.style.fontSize = isMobile ? '0.5em' : '0.7em';
        label.style.color = '#fff';
        label.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.5)';
        label.style.fontWeight = 'bold';
        
        photo.appendChild(emoji);
        photo.appendChild(label);
        
        // 添加悬停效果
        photo.addEventListener('mouseenter', () => {
            photo.style.transform = 'rotate(0deg) scale(1.1)';
            photo.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            photo.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        photo.addEventListener('mouseleave', () => {
            photo.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg) scale(1)';
            photo.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            photo.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // 添加点击效果
        photo.addEventListener('click', () => {
            showMemoryPopup(frame);
        });
        
        // 添加触摸效果
        photo.addEventListener('touchstart', () => {
            photo.style.transform = 'rotate(0deg) scale(1.1)';
            photo.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            photo.style.background = 'rgba(255, 255, 255, 0.2)';
        }, { passive: true });
        
        photo.addEventListener('touchend', () => {
            photo.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg) scale(1)';
            photo.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            photo.style.background = 'rgba(255, 255, 255, 0.1)';
            showMemoryPopup(frame);
        }, { passive: true });
        
        photoWall.appendChild(photo);
    });
    
    section.appendChild(photoWall);
    
    // 如果是移动设备，添加滑动指示器
    if (isMobile) {
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.bottom = '2px';
        indicator.style.left = '50%';
        indicator.style.transform = 'translateX(-50%)';
        indicator.style.color = 'rgba(255, 255, 255, 0.5)';
        indicator.style.fontSize = '0.6em';
        indicator.style.textAlign = 'center';
        indicator.style.width = '100%';
        indicator.style.pointerEvents = 'none';
        indicator.textContent = '← 滑动查看更多 →';
        section.appendChild(indicator);
        
        // 3秒后淡出
        setTimeout(() => {
            indicator.style.transition = 'opacity 1s ease';
            indicator.style.opacity = '0';
        }, 3000);
    }
}

// 显示记忆弹窗
function showMemoryPopup(frame) {
    // 检查是否已存在弹窗，如果有则先移除
    const existingPopup = document.querySelector('.memory-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // 创建弹窗
    const popup = document.createElement('div');
    popup.className = 'memory-popup';
    
    // 根据不同的框架显示不同的内容
    let content = '';
    switch(frame.label) {
        case '生日蛋糕':
            content = '生日是一年中最特别的日子，愿你的每一个愿望都能实现！';
            break;
        case '剧本杀':
            content = '紧张刺激的剧本杀环节，每个人都成为了故事的一部分。';
            break;
        case '美食时光':
            content = '美食不仅满足味蕾，更是连接彼此的纽带。';
            break;
        case '密室逃脱':
            content = '解谜破案，共同逃脱，这是智慧与团队合作的完美展现。';
            break;
        case '礼物时刻':
            content = '每一份礼物都承载着心意，每一次惊喜都值得铭记。';
            break;
        case '欢乐瞬间':
            content = '欢笑是最好的礼物，愿你的生活永远充满欢乐。';
            break;
        default:
            content = '这是一段美好的回忆，值得永远珍藏。';
    }
    
    // 创建弹窗内容
    popup.innerHTML = `
        <div class="memory-popup-emoji">${frame.emoji}</div>
        <div class="memory-popup-title">${frame.label}</div>
        <div class="memory-popup-content">${content}</div>
        <button class="memory-popup-close">关闭</button>
    `;
    
    // 添加到页面
    document.body.appendChild(popup);
    
    // 添加关闭按钮事件
    const closeButton = popup.querySelector('.memory-popup-close');
    closeButton.addEventListener('click', () => {
        popup.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            if (document.body.contains(popup)) {
                popup.remove();
            }
        }, 300);
    });
    
    // 点击弹窗外部关闭
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target) && e.target.className !== 'photo-frame' && !e.target.closest('.photo-frame')) {
            popup.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    popup.remove();
                }
            }, 300);
            document.removeEventListener('click', closePopup);
        }
    });
    
    // 添加触摸事件支持
    document.addEventListener('touchstart', function closeTouchPopup(e) {
        if (!popup.contains(e.target) && e.target.className !== 'photo-frame' && !e.target.closest('.photo-frame')) {
            popup.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    popup.remove();
                }
            }, 300);
            document.removeEventListener('touchstart', closeTouchPopup);
        }
    }, { passive: true });
}

// 创建倒计时效果
function createCountdown(section) {
    const countdownContainer = document.createElement('div');
    countdownContainer.className = 'countdown-container';
    countdownContainer.style.position = 'absolute';
    countdownContainer.style.top = '20px';
    countdownContainer.style.right = '20px';
    countdownContainer.style.background = 'rgba(0, 0, 0, 0.3)';
    countdownContainer.style.backdropFilter = 'blur(5px)';
    countdownContainer.style.borderRadius = '10px';
    countdownContainer.style.padding = '15px';
    countdownContainer.style.color = '#fff';
    countdownContainer.style.zIndex = '3';
    countdownContainer.style.textAlign = 'center';
    
    const title = document.createElement('div');
    title.textContent = '下次生日倒计时';
    title.style.marginBottom = '10px';
    title.style.fontSize = '0.9em';
    title.style.opacity = '0.8';
    
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'countdown-time';
    timeDisplay.style.fontSize = '1.2em';
    timeDisplay.style.fontWeight = 'bold';
    
    countdownContainer.appendChild(title);
    countdownContainer.appendChild(timeDisplay);
    
    section.appendChild(countdownContainer);
    
    // 更新倒计时
    function updateCountdown() {
        const now = new Date();
        const nextYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
        const nextBirthday = new Date(nextYear, 9, 15); // 假设生日是10月15日
        
        const diff = nextBirthday - now;
        
        // 计算天数、小时、分钟和秒数
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timeDisplay.textContent = `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
    }
    
    // 初始更新
    updateCountdown();
    
    // 每秒更新一次
    const countdownInterval = setInterval(updateCountdown, 1000);
    countdownContainer.countdownInterval = countdownInterval;
    
    return countdownInterval;
}

// 随机恐怖音效
function playHorrorSound() {
    // 停止之前可能正在播放的音效
    if (window.currentHorrorSound) {
        window.currentHorrorSound.pause();
        window.currentHorrorSound.currentTime = 0;
    }
    
    const sounds = [
        './resource/恐怖BGM_耳聆网_[声音ID：35884].wav',
        './resource/转码故障音频_耳聆网_[声音ID：18742].aiff'
    ];
    
    const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    sound.volume = 0.3;
    sound.play().catch(e => console.log('Audio play failed:', e));
    
    // 保存当前音效引用，以便后续可以停止
    window.currentHorrorSound = sound;
    
    return sound;
}

// 停止恐怖音效
function stopHorrorSound() {
    if (window.currentHorrorSound) {
        window.currentHorrorSound.pause();
        window.currentHorrorSound.currentTime = 0;
        window.currentHorrorSound = null;
    }
}

// 确保移动端highlight文字显示正常
function ensureHighlightVisibility() {
    const highlights = document.querySelectorAll('.highlight');
    const isMobile = window.innerWidth <= 768;
    
    highlights.forEach(highlight => {
        if (isMobile) {
            highlight.style.display = 'block';
            highlight.style.visibility = 'visible';
            highlight.style.opacity = '1';
            highlight.style.width = '100%';
            highlight.style.margin = '10px 0';
            highlight.style.wordBreak = 'break-word';
            highlight.style.whiteSpace = 'normal';
            highlight.style.overflow = 'visible';
        }
    });
}

// 在页面加载和窗口大小改变时调用
window.addEventListener('load', ensureHighlightVisibility);
window.addEventListener('resize', ensureHighlightVisibility);

// 添加滚动指示器
function addScrollIndicator() {
    // 创建滚动指示器
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    document.body.appendChild(indicator);
    
    // 更新指示器状态
    function updateIndicator() {
        const scrollPosition = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        // 如果已经滚动到底部，显示向上箭头
        if (scrollPosition > maxScroll * 0.8) {
            indicator.classList.add('up');
        } else {
            indicator.classList.remove('up');
        }
        
        // 如果在顶部且向上箭头，或在底部且向下箭头，隐藏指示器
        if ((scrollPosition < 100 && !indicator.classList.contains('up')) || 
            (scrollPosition > maxScroll * 0.95 && indicator.classList.contains('up'))) {
            indicator.style.opacity = '0';
            indicator.style.pointerEvents = 'none';
        } else {
            indicator.style.opacity = '1';
            indicator.style.pointerEvents = 'auto';
        }
    }
    
    // 点击指示器滚动
    indicator.addEventListener('click', function() {
        if (this.classList.contains('up')) {
            // 滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // 滚动到下一部分
            const sections = document.querySelectorAll('.section');
            const scrollPosition = window.scrollY;
            
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionTop = section.offsetTop;
                
                if (sectionTop > scrollPosition + 50) {
                    section.scrollIntoView({
                        behavior: 'smooth'
                    });
                    break;
                }
                
                // 如果是最后一个部分，滚动到底部
                if (i === sections.length - 1) {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
    
    // 监听滚动事件
    window.addEventListener('scroll', updateIndicator);
    
    // 初始更新
    updateIndicator();
}

// 添加交互提示
function addInteractionHints() {
    // 创建提示元素
    const hint = document.createElement('div');
    hint.className = 'interaction-hint';
    document.body.appendChild(hint);
    
    // 提示内容列表
    const hints = [
        '点击或触摸页面任何位置查看特效',
        '滑动屏幕查看更多内容',
        '点击照片查看详情',
        '尝试拖动密室模块改变顺序',
        '点击高亮文字获取更多信息'
    ];
    
    // 显示随机提示
    function showRandomHint() {
        // 随机选择一个提示
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        hint.textContent = randomHint;
        
        // 显示提示
        hint.classList.add('visible');
        
        // 3秒后隐藏提示
        setTimeout(() => {
            hint.classList.remove('visible');
        }, 3000);
    }
    
    // 初始显示提示
    setTimeout(showRandomHint, 5000);
    
    // 每30秒显示一次提示
    setInterval(showRandomHint, 30000);
}

// 添加一个函数来修复前言和回家部分的highlight文字在移动端不可见的问题
function fixIntroAndHomeHighlights() {
    const introHighlights = document.querySelectorAll('#intro .highlight');
    const homeHighlights = document.querySelectorAll('#home .highlight');
    const isMobile = window.innerWidth <= 768;
    
    // 修复前言部分的highlight
    introHighlights.forEach(highlight => {
        if (isMobile) {
            highlight.style.background = 'rgba(255, 105, 180, 0.8)';
            highlight.style.webkitBackgroundClip = 'initial';
            highlight.style.webkitTextFillColor = '#fff';
            highlight.style.backgroundClip = 'initial';
            highlight.style.color = '#fff';
            highlight.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            highlight.style.padding = '15px';
            highlight.style.borderRadius = '10px';
            highlight.style.display = 'block !important';
            highlight.style.visibility = 'visible !important';
            highlight.style.opacity = '1 !important';
            highlight.style.margin = '15px 0';
            highlight.style.textAlign = 'center';
            highlight.style.fontWeight = 'bold';
            highlight.style.boxShadow = '0 5px 15px rgba(255, 105, 180, 0.3)';
            highlight.style.zIndex = '10';
            highlight.style.position = 'relative';
        }
    });
    
    // 修复回家部分的highlight
    homeHighlights.forEach(highlight => {
        if (isMobile) {
            highlight.style.background = 'rgba(147, 112, 219, 0.8)';
            highlight.style.webkitBackgroundClip = 'initial';
            highlight.style.webkitTextFillColor = '#fff';
            highlight.style.backgroundClip = 'initial';
            highlight.style.color = '#fff';
            highlight.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            highlight.style.padding = '15px';
            highlight.style.borderRadius = '10px';
            highlight.style.display = 'block !important';
            highlight.style.visibility = 'visible !important';
            highlight.style.opacity = '1 !important';
            highlight.style.margin = '15px 0';
            highlight.style.textAlign = 'center';
            highlight.style.fontWeight = 'bold';
            highlight.style.boxShadow = '0 5px 15px rgba(147, 112, 219, 0.3)';
            highlight.style.zIndex = '10';
            highlight.style.position = 'relative';
        }
    });
}

// 在页面加载和窗口大小改变时调用
window.addEventListener('load', fixIntroAndHomeHighlights);
window.addEventListener('resize', fixIntroAndHomeHighlights);

// 在滚动时也调用，确保在滚动到相应部分时文字可见
window.addEventListener('scroll', function() {
    // 使用节流函数限制执行频率，防止频繁触发
    if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
        const visibleSection = document.querySelector('.section.visible');
        if (visibleSection && (visibleSection.id === 'intro' || visibleSection.id === 'home')) {
            fixIntroAndHomeHighlights();
        }
    }, 200); // 200毫秒的延迟
});

// 强制显示highlight文字，解决移动端可能的显示问题
function forceHighlightDisplay() {
    // 直接选择所有前言和回家部分的highlight元素
    const introHighlight = document.querySelector('#intro .highlight');
    const homeHighlight = document.querySelector('#home .highlight');
    
    if (introHighlight) {
        introHighlight.setAttribute('style', 
            'display: block !important; visibility: visible !important; opacity: 1 !important; ' +
            'background: rgba(255, 105, 180, 0.8) !important; color: #fff !important; ' +
            'padding: 15px !important; border-radius: 10px !important; margin: 15px 0 !important; ' +
            'text-align: center !important; font-weight: bold !important; z-index: 10 !important; position: relative !important;'
        );
    }
    
    if (homeHighlight) {
        homeHighlight.setAttribute('style', 
            'display: block !important; visibility: visible !important; opacity: 1 !important; ' +
            'background: rgba(147, 112, 219, 0.8) !important; color: #fff !important; ' +
            'padding: 15px !important; border-radius: 10px !important; margin: 15px 0 !important; ' +
            'text-align: center !important; font-weight: bold !important; z-index: 10 !important; position: relative !important;'
        );
    }
}

// 页面加载后立即调用，并设置定时器确保在DOM完全渲染后执行
window.addEventListener('load', function() {
    forceHighlightDisplay();
    // 再次延迟执行，确保样式被应用
    setTimeout(forceHighlightDisplay, 500);
    setTimeout(forceHighlightDisplay, 1000);
});

function initScrollObserver() {
    const sections = document.querySelectorAll('.section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // 更新section的可见性
                entry.target.classList.add('visible');
                
                // 更新时间轴项的激活状态
                timelineItems.forEach(item => {
                    if (item.getAttribute('data-section') === sectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}


