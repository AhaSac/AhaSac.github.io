

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']


window.addEventListener('DOMContentLoaded', event => {

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
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
