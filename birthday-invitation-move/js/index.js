// 检测是否为移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 添加一个变量来记录上一个视图状态
let lastViewState = null;

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
    const invitationCard = document.querySelector('.invitation-card');
    
    const validPasswords = ['5623', '7895', '1548', '6397', '4568'];
    
    if (validPasswords.includes(password)) {
        // 密码正确时的动画效果
        passwordInput.style.borderColor = '#4CAF50';
        passwordInput.style.backgroundColor = 'rgba(76, 175, 180, 0.1)';
        
        // 添加成功动画
        const successParticles = createSuccessParticles();
        document.body.appendChild(successParticles);
        
        // 隐藏密码区域
        passwordSection.style.animation = 'fadeOut 0.8s ease-out forwards';
        
        setTimeout(() => {
            passwordSection.classList.add('hidden');
            // 显示邀请函内容
            invitationContent.classList.remove('hidden');
            invitationContent.classList.add('fade-scale-in');
            
            // 添加内容动画
            const contentItems = document.querySelectorAll('.content-item');
            contentItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, 200 * (index + 1));
            });

            bindConfirmButton();
        }, 800);
    } else {
        // 密码错误时的动画效果
        passwordInput.classList.add('shake');
        passwordInput.style.borderColor = '#ff4444';
        passwordInput.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
        
        // 添加错误提示
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = '密码错误，请重试！';
        passwordSection.appendChild(errorMessage);
        
        // 添加失败动画
        const errorParticles = createErrorParticles();
        document.body.appendChild(errorParticles);
        
        setTimeout(() => {
            passwordInput.classList.remove('shake');
            passwordInput.style.borderColor = '';
            passwordInput.style.backgroundColor = '';
            errorMessage.remove();
            errorParticles.remove();
        }, 1000);
        
        passwordInput.value = '';
    }
}

// 创建成功粒子效果
function createSuccessParticles() {
    const container = document.createElement('div');
    container.className = 'particles-container success-particles';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle success';
        container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 1000);
    return container;
}

// 创建失败粒子效果
function createErrorParticles() {
    const container = document.createElement('div');
    container.className = 'particles-container error-particles';
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle error';
        container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 1000);
    return container;
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
            
            timelineContainer.classList.remove('hidden');
            contentSections.classList.remove('hidden');
            timelineContainer.style.opacity = '0';
            contentSections.style.opacity = '0';
            
            preloadSectionContent();
            
            invitationCard.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                invitationCard.style.display = 'none';
                hideLoadingIndicator();
                
                timelineContainer.style.opacity = '1';
                contentSections.style.opacity = '1';
                
                timelineContainer.classList.add('fade-in');
                contentSections.classList.add('fade-in');
                
                initScrollListener();
                
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
        } else {
            section.classList.remove('visible');
        }
    });
}

// 关闭邀请函
function closeInvitation() {
    const invitationCard = document.querySelector('.invitation-card');
    const cryingMessage = document.getElementById('crying-message');
    
    // 添加关闭动画
    invitationCard.style.animation = 'fadeOut 0.5s ease-out forwards';
    
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
    
    cryingMessage.classList.remove('fade-scale-in');
    cryingMessage.classList.add('hidden');
    
    switch(lastViewState) {
        case 'invitation':
            // 返回邀请函
            invitationCard.style.display = 'block';
            invitationCard.style.opacity = '1';
            invitationCard.style.visibility = 'visible';
            invitationCard.classList.add('show');
            break;
            
        case 'password':
            // 返回密码输入界面
            passwordSection.classList.remove('hidden');
            passwordSection.style.animation = 'fadeIn 0.5s ease-out forwards';
            break;
            
        default:
            // 默认显示内容区域
            const timelineContainer = document.getElementById('timeline-container');
            const contentSections = document.getElementById('content-sections');
            
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

// 创建雨滴效果
function createRain() {
    const rainContainer = document.getElementById('rainContainer');
    const dropCount = isMobile ? 20 : 30;
    
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        rainContainer.appendChild(drop);
    }
}

// 检查访问次数
function checkVisitCount() {
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount = parseInt(visitCount) + 1;
    localStorage.setItem('visitCount', visitCount);
    
    if (visitCount === 1) {
        const visitMessage = document.getElementById('visitMessage');
        visitMessage.classList.remove('hidden');
        visitMessage.classList.add('fade-scale-in');
    }
}

// 关闭访问消息
function closeVisitMessage() {
    const visitMessage = document.getElementById('visitMessage');
    visitMessage.classList.remove('fade-scale-in');
    visitMessage.classList.add('hidden');
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initMobileEnhancements();
    createRain();
    checkVisitCount();
    
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
    
    envelope.addEventListener('click', function() {
        // 添加点击动画
        this.classList.add('clicked');
        
        // 显示邀请卡
        invitationCard.classList.add('show');
        invitationCard.style.opacity = '1';
        invitationCard.style.visibility = 'visible';
        
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
});
