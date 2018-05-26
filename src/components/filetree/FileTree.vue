<template>
  <div>
    <div v-if="sshActive">
      <div v-if="sftpActive" style="position:relative">
        <span v-html="$t('console.file_transfer.modal_upload_hint')"></span>
        <Upload multiple type="drag" :action="sftp_upload_action">
          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag files here to upload</p>
          </div>
         </Upload>
        <span v-html="$t('console.file_transfer.explore_files')"></span>
        <Tree :data="wheel" :load-data="ls" :render="renderFileTree" empty-text="Nothing in this directory"></Tree>
        <!--<Spin size="large" fix v-if="fileItemsLoading"></Spin>-->
      </div>
      <div v-else>
        <Button type="ghost" icon="android-add" :loading="sftpConnectLoading" @click="openSftpConnection">
          <span v-if="!sftpConnectLoading">{{$t("console.file_transfer.connect_to_sftp_server")}}</span>
          <span v-else>Loading...</span>
        </Button>
      </div>
    </div>
    <div v-else class="ssh-not-active"> <!--not active-->
      <Icon type="android-warning"></Icon> {{$t("console.file_transfer.ssh_not_active")}}
    </div>
  </div>
</template>

<script>
import Config from '@/config/config'
import Utils from '@/libs/utils'
import stringFormat from '@/libs/string_format'
import apiRouters from '@/config/api_routers'

export default {
  name: 'file-tree',
  data () {
    return {
      sftpActive: false,
      sftpConnectLoading: false,
      sftpConId: '',
      sftpSocket: null,
      wheel:
        [
          {
            title: 'HOME',
            is_dir: true,
            path: '',
            loading: false,
            children: []
          }
        ]
    }
  },
  computed: {
    sftp_upload_action () {
      const _t = sessionStorage.getItem(Config.jwt.tokenName)
      if (_t) {
        return Utils.loadUrl(apiRouters.router.sftp_upload, stringFormat.format(apiRouters.params.sftp_upload, _t, this.sftpConId))
      }
      return ''
    }
  },
  props: {
    sshActive: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    sshActive: function () {
      if (!this.sshActive && this.sftpSocket) {
        this.sftpSocket.close() // todo
      }
    }
  },
  methods: {
    renderFileTree (h, { root, node, data }) {
      const _this = this
      let icon = 'ios-paper-outline'
      if (data.is_dir) {
        icon = 'android-folder'
      }
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', {
          on: {
            click () {
              _this.onTreeItemSelected(data)
            }
          }
        }, [
          h('Icon', {
            props: {
              type: icon
            },
            style: {
              marginRight: '8px'
            }
          }),
          h('span', {
            class: [
              'ivu-tree-title',
              {
                'ivu-tree-title-selected': data.selected
              }
            ]
          }, data.title)
        ])
      ])
    },
    ls (item, callback) { // item.is_dir === true.
      const path = item.path
      const _t = sessionStorage.getItem(Config.jwt.tokenName)
      if (_t) {
        Utils.axiosInstance.get(Utils.loadUrl(apiRouters.router.sftp_ls,
          stringFormat.format(apiRouters.params.sftp_ls, _t, this.sftpConId, path)), {
        }).then((response) => {
          try {
            if (!response.data || response.data.has_error) {
              this.$Message.error(this.$t('console.file_transfer.error_while_ls', { dir: path })) // todo dir not shown
              const d = []
              callback(d)
            } else {
              const messages = response.data.message
              let children = []
              messages.forEach((ele) => {
                if (ele.is_dir) {
                  children.push({title: ele.name, is_dir: ele.is_dir, path: ele.path, loading: false, children: []})
                } else {
                  children.push({title: ele.name, is_dir: ele.is_dir, path: ele.path})
                }
              })
              // todo empty-text
              if (children.length === 0) {
                this.$Message.warning(this.$t('console.file_transfer.empty_dir'))
              }
              callback(children) // only callback here todo handle error for loading.
            }
          } catch (e) {
            this.$Message.error(this.$t('console.file_transfer.error_while_ls', { dir: path }))
            const d = []
            callback(d)
          }
        })
      }
    },
    onTreeItemSelected (item) {
      if (!item.is_dir) {
        const path = item.path
        // const filename = item.name
        const _t = sessionStorage.getItem(Config.jwt.tokenName)
        if (_t) {
          window.open(Utils.loadUrl(apiRouters.router.sftp_dl,
            stringFormat.format(apiRouters.params.sftp_dl, _t, this.sftpConId, path)), '_self', false)
        }
      }
    },
    openSftpConnection () {
      let _t = sessionStorage.getItem(Config.jwt.tokenName)
      if (_t) {
        this.sftpConnectLoading = true
        const socket = new WebSocket(Utils.loadWebSocketUrl(apiRouters.router.ws_sftp,
          stringFormat.format(apiRouters.params.ws_sftp, _t)))
        this.sftpSocket = socket
        this.sftpConnectLoading = false
        this.sftpActive = true

        socket.onmessage = (event) => { // bind webSocket message event
          let message = JSON.parse(event.data)
          this.handleWebSocketMessage(message)
        }

        let heartBeatTimer = setInterval(() => {
          socket.send(JSON.stringify({type: 'heartbeat', data: ''}))
        }, 20 * 1000)

        socket.onclose = () => { // bind webSocket close event
          this.sftpActive = false
          clearInterval(heartBeatTimer) // cancel heartbeat package sending.
        }
      } else {
        this.$Notice.error({
          title: this.$t('console.web_socket_expire')
        })
      }
    },
    handleWebSocketMessage (message) {
      switch (message.type) {
        case apiRouters.CID:
          this.sftpConId = message.data
          break
      }
    }
  }
}
</script>

<style scoped>
.ssh-not-active{
  color:#ff9900;
}
/*.color-safe{*/
  /*color:#19be6b;*/
/*}*/
/*.color-info{*/
/*color:#5cadff*/
/*}*/
/*.color-primary{*/
 /*color:#2d8cf0*/
/*}*/
/*.color-content {*/
  /*color: #495060*/
/*}*/
/*.color-title {*/
  /*color: #1c2438*/
/*}*/
</style>
