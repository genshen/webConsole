<style scoped>
.console {
  width: 100%;
  height: 100%;
  text-align: center;
}

.header {
  height: 60px;
}

.toolsbar {
  position: absolute;
  right: 80px;
  top: 160px;
  z-index: 10;
}

.toolsbar_exit_fullscreen {
  position: absolute;
  right: 80px;
  top: 90px;
  z-index: 902;
}

#terminal {
  font-size: 14px;
  height: calc(100% - 60px);
  background: #1b212f; /*todo color with terminal background*/
}

.layout-logo {
  width: 100px;
  height: 30px;
  background: #5b6270;
  border-radius: 3px;
  float: left;
  position: relative;
  top: 15px;
  left: 20px;
}

.layout-nav-header {
  height: 60px;
  text-align: left;
  padding-left: 6px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.layout-nav-header i {
  color: #fff;
}

.layout-nav {
  margin: 0 auto;
}

.layout-nav-right {
  float: right;
  padding-right: 36px;
  text-align: right;
}

.file-transfer-sub_title {
  font-weight: normal;
}
</style>
<style>
/* the value of z-index of iview.notice is 1010
  and, the value of z-index of top Menu is 900 */
#terminal .xterm.fullscreen {
  z-index: 901;
}
</style>
<template>
  <div class="console" @keyup.esc="exitFullscreenMode">
    <div class="header">
      <i-menu mode="horizontal" theme="dark" active-name="1">
        <Row>
          <i-col :xs="0" :sm="6"> <div class="layout-logo"></div> </i-col>
          <i-col :xs="8" :sm="0">
            <div class="layout-nav-header">
              <i-button type="text">
                <Icon type="navicon" size="32"></Icon>
              </i-button>
            </div>
          </i-col>
          <i-col :xs="0" :sm="12">
            <div class="layout-nav">
              <Icon v-if="connectionAlive" type="record" color="#19be6b"></Icon>
              <Icon v-else type="record" color="#bbbec4"></Icon>
              <a href="javascript:void(0)">{{ host }}</a>
            </div>
          </i-col>
          <i-col :xs="16" :sm="6">
            <div class="layout-nav-right">
              <router-link v-if="!connectionAlive" :to="{ path: 'signin' }">
                {{ $t("console.relogin") }}
              </router-link>
              <Dropdown v-else @on-click="handleDropdownMunu">
                <a href="javascript:void(0)">
                  <Icon type="person"></Icon>&nbsp;{{ username }}
                  <Icon type="arrow-down-b"></Icon>
                </a>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="exit">
                    <Icon type="android-exit"></Icon>&emsp;
                    {{ $t("console.nav_user_exit") }}
                  </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </div>
          </i-col>
        </Row>
      </i-menu>
    </div>
    <Modal
      v-model="fileTransferModal"
      :width="720"
      :closable="false"
      :mask-closable="false"
      :scrollable="true"
    >
      <!-- todo cancel closable. -->
      <p slot="header">
        <Icon type="arrow-swap"></Icon>
        <span>{{ $t("console.modal_file_transfer_title") }}</span>
        <span class="file-transfer-sub_title">
          ( <a>sftp://{{ username }}@{{ host }}</a> )
        </span>
      </p>
      <FileTree :sshActive="connectionAlive"></FileTree>
      <!-- files are listed here -->
      <div slot="footer">
        <i-button type="primary" @click="fileTransferModalOnOk" size="large">
          {{ $t("console.modal_file_transfer_ok_btn") }}
        </i-button>
      </div>
    </Modal>
    <div class="toolsbar">
      <!--
        <Button type="primary" size="large" shape="circle" icon="wrench"></Button>
      -->
      <Button-group vertical>
        <i-button
          type="primary"
          size="large"
          @click="toolsBarRefresh"
          :title="$t('console.toolsbar_refresh')"
          icon="android-refresh"
        ></i-button>
        <i-button
          type="primary"
          size="large"
          @click="toolsBarFileTransfer"
          :title="$t('console.toolsbar_file_transfer')"
          icon="arrow-swap"
        ></i-button>
        <i-button
          type="primary"
          size="large"
          @click="toolsBarFullscreen"
          :title="$t('console.toolsbar_fullscreen')"
          icon="android-expand"
        ></i-button>
        <i-button
          type="primary"
          size="large"
          @click="toolsBarSettings"
          :title="$t('console.toolsbar_settings')"
          icon="settings"
        ></i-button>
      </Button-group>
    </div>
    <div v-show="statusIsFullscreen" class="toolsbar_exit_fullscreen">
      <i-button
        type="primary"
        size="large"
        @click="exitFullscreenMode"
        :title="$t('console.toolsbar_exit_fullscreen')"
        icon="android-contract"
      ></i-button>
    </div>
    <div id="terminal"></div>
  </div>
</template>
<script>
import { Terminal } from "xterm";
import FileTree from "./filetree/FileTree";
import Util from "@/libs/utils";
import Config from "@/config/config";
import sshWebSocket from "@/libs/sshwebsocket";
import stringFormat from "@/libs/string_format";
import apiRouters from "@/config/api_routers";
import theme from "@/config/terminal_theme";

// import 'xterm/dist/xterm.css';  //xterm.css D:\workspace\javascript\frontend\sshwebconsole\node_modules\
import * as fit from "xterm/lib/addons/fit/fit";
import * as fullscreen from "xterm/lib/addons/fullscreen/fullscreen";
import "xterm/lib/addons/fullscreen/fullscreen.css";
/* And for typescript, see: https://webpack.js.org/guides/typescript/ */

let term = null;

export default {
  components: {
    FileTree
  },
  data() {
    return {
      connectionAlive: false,
      host: "waiting connection",
      username: "Loading",
      statusIsFullscreen: false,
      termConfig: {
        cols: 120,
        rows: 28
      },
      fileTransferModal: false
    };
  },
  computed: {
    httpAuthHeader: function() {
      let token = sessionStorage.getItem(Config.jwt.tokenName);
      return { Authorization: "Bearer " + token };
    }
  },
  methods: {
    handleDropdownMunu(name) {
      switch (name) {
        case "exit":
          // window.open("")
          this.$Message.warning("under developing"); // todo
          break;
      }
    },
    toolsBarRefresh() {
      this.$Message.warning("under developing"); // todo
    },
    toolsBarFileTransfer() {
      this.fileTransferModal = true;
    },
    toolsBarFullscreen() {
      this.$Notice.open({
        title: this.$t("console.ecs_to_exit_fullscreen")
      });
      this.statusIsFullscreen = true;
      term.toggleFullScreen(true);
      return false;
    },
    toolsBarSettings() {
      this.$Message.warning("under developing"); // todo
    },
    exitFullscreenMode() {
      this.statusIsFullscreen = false;
      term.toggleFullScreen(false);
    },
    fileTransferModalOnOk() {
      this.fileTransferModal = false;
    }
  },
  created() {
    if (window.localStorage.getItem("user.host")) {
      this.host = window.localStorage.getItem("user.host");
    }
    if (window.localStorage.getItem("user.username")) {
      this.username = window.localStorage.getItem("user.username");
    }
    // this.$router.replace({ name: 'signin' })
  },
  mounted() {
    // let self = this
    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    term = new Terminal({
      cursorBlink: true,
      bellStyle: "sound",
      theme: theme.default_theme
    });

    term.open(document.getElementById("terminal"));
    term.on("resize", size => {
      this.termConfig.rows = size.rows;
      this.termConfig.cols = size.cols;
    });
    term.fit();

    let _t = sessionStorage.getItem(Config.jwt.tokenName);
    if (_t) {
      const socket = new WebSocket(
        Util.loadWebSocketUrl(
          apiRouters.router.ws_ssh,
          stringFormat.format(
            apiRouters.params.ws_ssh,
            this.termConfig.cols,
            this.termConfig.rows,
            _t
          )
        )
      );
      // console.log(Util.loadWebSocketUrl(Config.net.webSocketProtocol, '/ws/ssh', 'cols=' + this.termConfig.cols + '&rows=' + this.termConfig.rows +
      //   '&' + Config.jwt.tokenName + '=' + _t))
      this.connectionAlive = true;

      socket.onclose = () => {
        term.setOption("cursorBlink", false);
        sessionStorage.removeItem(Config.jwt.tokenName);
        this.connectionAlive = false;
        this.$Notice.error({
          title: this.$t("console.web_socket_disconnect")
        });
      };
      sshWebSocket.bindTerminal(term, socket, true, -1);
    } else {
      this.$Notice.error({
        title: this.$t("console.web_socket_expire")
      });
      this.$router.replace({ name: "signin" });
    }
  }
};
</script>
