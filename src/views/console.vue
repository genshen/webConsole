<style scoped>
.console {
    width: 100%;
    height:100%;
    text-align: center;
}
.header{
    height:60px;
}
.toolsbar{
    position:absolute;
    right:80px;
    top:160px;
    z-index: 10;
}
.toolsbar_exit_fullscreen{
    position:absolute;
    right:80px;
    top:90px;
    z-index:256;
}
#terminal {
    font-size: 14px;
    height:calc(100% - 60px);
    background:#000000;
    padding:0 0 0 6px;
}

.layout-logo{
        width: 100px;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 20px;
}
.layout-nav-header{
    height: 60px;
    text-align:left;
    padding-left:6px;
    box-shadow: 0 1px 1px rgba(0,0,0,.1);
}
.layout-nav-header i{
    color:#fff;
}
.layout-nav{
    margin: 0 auto;
}
.layout-nav-right{
    float:right;
    padding-right: 36px;
    text-align:right;
}
</style>
<style>

</style>
<template>
    <div class="console" @keyup.esc="exitFullscreenMode">
        <div class="header">
            <Menu mode="horizontal" theme="dark" active-name="1">
                <Row>
                    <Col :xs="0" :sm="6">
                        <div class="layout-logo"></div>
                    </Col>
                     <Col :xs="8" :sm="0">
                        <div class="layout-nav-header">
                            <i-button type="text">
                                <Icon type="navicon" size="32"></Icon>
                            </i-button>
                        </div>
                    </Col>
                    <Col :xs="0" :sm="12">
                        <div class="layout-nav">
                            <Icon v-if="connectionAlive" type="record" color="#19be6b"></Icon>
                            <Icon v-else type="record" color="#bbbec4"></Icon>
                            <a href="javascript:void(0)">{{host}}</a>
                        </div>
                    </Col>
                    <Col :xs="16" :sm="6">
                        <div class="layout-nav-right">
                            <router-link  v-if="!connectionAlive" :to="{ path: 'signin' }">{{$t('console.relogin')}}</router-link>
                            <Dropdown v-else @on-click="handleDropdownMunu">
                                <a href="javascript:void(0)">
                                    <Icon type="person"></Icon>&nbsp;{{username}}
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <Dropdown-menu slot="list">
                                    <Dropdown-item name="exit">
                                        <Icon type="android-exit"></Icon>&emsp; {{$t("console.nav_user_exit")}}
                                    </Dropdown-item>
                                </Dropdown-menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </Menu>
        </div>
        <div class="toolsbar">
            <!-- <Button type="primary" size="large" shape="circle" icon="wrench"></Button> -->
            <Button-group vertical>
                <Button type="primary" size="large" @click="toolsBarRefresh" :title="$t('console.toolsbar_refresh')" icon="android-refresh"></Button>
                <Button type="primary" size="large" @click="toolsBarUploadFiles" :title="$t('console.toolsbar_upload_files')" icon="android-upload"></Button>
                <Button type="primary" size="large" @click="toolsBarFullscreen" :title="$t('console.toolsbar_fullscreen')" icon="android-expand"></Button>
                <Button type="primary" size="large" @click="toolsBarSettings" :title="$t('console.toolsbar_settings')" icon="settings"></Button>
            </Button-group>
        </div>
        <div v-show="statusIsFullscreen" class="toolsbar_exit_fullscreen">
            <Button type="primary" size="large" @click="exitFullscreenMode" :title="$t('console.toolsbar_exit_fullscreen')" icon="android-contract"></Button>
        </div>
        <div id="terminal"></div>
    </div>
</template>
<script>
import Terminal from 'xterm';
import Util from '../libs/util';
let term = null;

export default {
     data(){
            return{
                connectionAlive:true,
                host:'waiting connection',
                username:'Loading',
                statusIsFullscreen: false
            }
    },
    methods: {
        handleStart() {
            this.$Modal.info({
                title: 'Bravo',
                content: 'Now, enjoy the convenience of iView.'
            });
        },
        handleDropdownMunu(name){
            switch(name){
                case 'exit':
                // window.open("");
                    this.$Message.warning('under developing'); //todo
                break;
            }
        },
        toolsBarRefresh(){
            this.$Message.warning('under developing'); //todo
        },
        toolsBarUploadFiles(){
            this.$Message.warning('under developing'); //todo
        },
        toolsBarFullscreen(){
            this.$Notice.open({
                title: this.$t('console.ecs_to_exit_fullscreen')
            });
            this.statusIsFullscreen = true;
            term.toggleFullscreen(true);
            return false;
        },
        toolsBarSettings(){
            this.$Message.warning('under developing'); //todo
        },
        exitFullscreenMode(){
            this.statusIsFullscreen = false;
            term.toggleFullscreen(false);
        }
    },
    created() {
        if (window.localStorage.getItem('user.host')) {
            this.host = window.localStorage.getItem('user.host');
        }
        if (window.localStorage.getItem('user.username')) {
            this.username = window.localStorage.getItem('user.username');
        }
        // this.$router.replace({ name: 'signin' });
    },
    mounted() {
        // let self = this;
        term = new Terminal({
            cursorBlink: true,
            rows: 28
        });
        Terminal.loadAddon('attach');
        Terminal.loadAddon('fullscreen');
        Terminal.loadAddon('fit');

        term.open(document.getElementById('terminal'));
        term.fit();
        let socket = new WebSocket('ws://' + Util.config.Domain + '/ws/ssh');
        socket.onclose = (() =>{
            //todo set cursorBlink to false
            this.connectionAlive = false;
            this.$Notice.error({
                title: this.$t('console.web_socket_disconnect')
            });
        });
        term.attach(socket);
    }
};
</script>
