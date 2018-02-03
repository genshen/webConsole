export default {
  'zh-CN': {
    global: {
      home: '首页',
      switch_lang: 'En',
      error_happened_try_refresh: 'Oh! 出现了一个错误,请刷新后重试.'
    },
    index: {
      welcome: '欢迎使用 SSH web Console',
      goto_signin: '去往登录页面'
    },
    console: {
      file_transfer: {
        ssh_not_active: 'ssh未连接,请先连接ssh',
        connect_to_sftp_server: '新建SFTP连接',
        modal_upload_hint: '文件将上传至 "<b>~/tmp</b>" 目录下',
        explore_files: '<b>浏览文件</b>:',
        error_while_ls: '获取目录<i>{dir}</i>信息错误',
        error_download_file: '下载文件 <i>{name}</i> 出错',
        empty_dir: '空目录'
      },
      nav_doc: '帮助文档',
      nav_hpcer: 'HPCer',
      nav_project: '项目',
      nav_about: '关于',
      nav_user_exit: '退出',
      toolsbar_refresh: '刷新',
      toolsbar_file_transfer: '文件传输',
      toolsbar_fullscreen: '全屏',
      toolsbar_settings: '设置',
      toolsbar_exit_fullscreen: '退出全屏',
      web_socket_disconnect: '已断开与远程主机连接',
      web_socket_expire: '当前登录状态已失效,请重新登录',
      relogin: '重新登录',
      ecs_to_exit_fullscreen: '按 <b>ESC</b> 键以退出全屏模式',
      modal_file_transfer_title: '文件传输',
      modal_file_transfer_ok_btn: '完成'
    },
    signin: {
      form_title: '登录 SSH Web Console',
      form_fullhost_prepend: '主机:',
      form_fullhost_ph: 'ip:端口号 (例: hpc.gensh.me:22)',
      form_username_ph: '用户名',
      form_passwd_ph: '密码',
      form_submit_btn: '登录',
      form_submit_btn_loading: '正在登录',
      form_fullhost_required: '主机地址不能为空',
      form_fullhost_error: '主机地址不符合规范',
      form_username_required: '用户名不能为空',
      form_passwd_required: '密码不能为空',
      form_has_error: '登录信息填写有误',
      form_error_passport: '主机名或用户名或密码错误',
      form_error_remote_server: '服务器连接错误',
      form_error_ssh_login: '尝试ssh登录出错', // error test "who am i"
      signin_success: '登录成功!'
    }
  },
  'en-US': {
    global: {
      home: 'Home',
      switch_lang: '中文',
      error_happened_try_refresh: 'Oh! A error happend.Please refresh the page.'
    },
    index: {
      welcome: 'Welcome to SSH web Console',
      goto_signin: 'Go to Sign in Page'
    },
    console: {
      file_transfer: {
        ssh_not_active: 'ssh is not active, please login in ssh first.',
        connect_to_sftp_server: 'Start a new sftp connection',
        modal_upload_hint: 'files will be uploaded to directory "<b>~/tmp</b>" .',
        explore_files: '<b>Explore Files</b>:',
        error_while_ls: 'error happened while list directory <i>{dir}</i>',
        error_download_file: 'error happened while download file <i>{name}</i>',
        empty_dir: 'Empty Directory'
      },
      nav_doc: 'Docs',
      nav_hpcer: 'HPCer',
      nav_project: 'Projects',
      nav_about: 'About',
      nav_user_exit: 'Exit',
      toolsbar_refresh: 'refresh',
      toolsbar_file_transfer: 'file transfer',
      toolsbar_fullscreen: 'fullscreen',
      toolsbar_settings: 'settings',
      toolsbar_exit_fullscreen: 'exit fullscreen',
      web_socket_disconnect: 'Disconnected from remote host',
      web_socket_expire: 'Your session has been expired,please relogin.',
      relogin: 'Relogin',
      ecs_to_exit_fullscreen: 'To exit fullscreen Mode,please press <b>ESC</b> key',
      modal_file_transfer_title: 'File Transfer',
      modal_file_transfer_ok_btn: 'Finish'
    },
    signin: {
      form_title: 'Sign In SSH Web Console',
      form_fullhost_prepend: 'host:',
      form_fullhost_ph: 'ip:port (e.g: hpc.gensh.me:22)',
      form_username_ph: 'Username',
      form_passwd_ph: 'Password',
      form_submit_btn: 'Sign In',
      form_submit_btn_loading: 'Loading',
      form_fullhost_required: 'host is required',
      form_fullhost_error: 'host is not the right form',
      form_username_required: 'username is required',
      form_passwd_required: 'password is required',
      form_has_error: 'There are some errors in the form,check again.',
      form_error_passport: 'Error host or username or password',
      form_error_remote_server: 'Error connecting to remote server',
      form_error_ssh_login: 'Error to execute ssh login',
      signin_success: 'success!'
    }
  }
}
