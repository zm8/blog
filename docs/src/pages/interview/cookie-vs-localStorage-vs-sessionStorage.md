# cookie, localStorage, sessionStorage 区别

1. cookie 不设置有效期, 就是存储在会话中, 会话结束, cookie 就失效了; 如果设置有效期, cookie 就存储在硬盘中; cookie 可以设置域名跨子域存储;

2. localstorage 生命周期永远, 关闭浏览器也还存在; 存储在当前域名下面;

3. sessionStorage 只在当前会话下有效; 就是在当前窗口存储, 当前 Tab 刷新还在; 但是当前窗口如果关闭, 则销毁;

4. cookie 数据每次都会发送服务端; 而 localstorage 和 sessionStorage 不会和服务器通信;

5. cookie 存储数据 5k; localstorage 和 sessionStorage 在 5M
