

const content_dir = 'contents/'
const section_names = ['home', 'publications', 'awards', 'photo']

// 语言状态管理
let currentLanguage = localStorage.getItem('siteLang') || 'zh';

function getConfigFile() {
    return `${currentLanguage}/config.yml`;
}

function getMdFile(name) {
    return `${currentLanguage}/${name}.md`;
}

function switchLanguage(lang) {
    if (lang === currentLanguage) return;
    currentLanguage = lang;
    localStorage.setItem('siteLang', lang);
    location.reload();
}

window.addEventListener('DOMContentLoaded', event => {

    // 根据当前语言显示/隐藏语言按钮，并更新导航文本
    if (currentLanguage === 'zh') {
        document.getElementById('lang-zh').style.display = 'none';
        document.getElementById('lang-en').style.display = 'block';
    } else {
        document.getElementById('lang-zh').style.display = 'block';
        document.getElementById('lang-en').style.display = 'none';
    }

    // 统一设置导航栏为英文（除语言切换外）
    const homeNav = document.getElementById('nav-home');
    if (homeNav) homeNav.textContent = 'HOME';
    
    const photoNav = document.getElementById('nav-photo');
    if (photoNav) photoNav.textContent = 'PHOTO';

    // 读取实际导航栏高度，写入 CSS 变量，避免顶部内容被 fixed header 压住裁剪
    function syncNavHeight() {
        const header = document.querySelector('.header');
        if (!header) return;

        const height = Math.ceil(header.getBoundingClientRect().height);
        if (height > 0) {
            document.documentElement.style.setProperty('--nav-height', `${height}px`);
        }
    }

    syncNavHeight();
    window.addEventListener('resize', syncNavHeight);
    // 字体/布局晚一点稳定后再同步一次
    setTimeout(syncNavHeight, 100);
    setTimeout(syncNavHeight, 500);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // 标题下划线随滚动变化
    function updateTitleUnderlines() {
        const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const underlineWidth = Math.min(scrollPercentage * 100, 100);
        
        
        document.querySelectorAll('section header h2').forEach(title => {
            title.style.setProperty('--underline-width', underlineWidth + '%');
        });

        const header = document.querySelector('.header');
        if (header) {
            header.style.setProperty('--header-underline-width', underlineWidth + '%');
        }
    }

    window.addEventListener('scroll', updateTitleUnderlines);

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + getConfigFile())
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const targetElement = document.getElementById(key);
                if (targetElement) {
                    targetElement.innerHTML = yml[key];
                }
            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        const targetElement = document.getElementById(name + '-md');
        if (targetElement) {
            fetch(content_dir + getMdFile(name))
                .then(response => response.text())
                .then(markdown => {
                    const html = marked.parse(markdown);
                    targetElement.innerHTML = html;
                }).then(() => {
                    // MathJax
                    MathJax.typeset();
                })
                .catch(error => console.log(error));
        }
    })

    // 语言切换按钮
    const enButton = document.querySelector('[data-lang="en"]');
    if (enButton) {
        enButton.addEventListener('click', (e) => {
            e.preventDefault();
            switchLanguage('en');
        });
    }
    const zhButton = document.querySelector('[data-lang="zh"]');
    if (zhButton) {
        zhButton.addEventListener('click', (e) => {
            e.preventDefault();
            switchLanguage('zh');
        });
    }

}); 
