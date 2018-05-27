<style scoped>
  .files-tree-list{
    height: 300px; /*the same as the height in class directory*/
  }
  .files-tree-list .files-tree{
    height: 280px;
    overflow-y: auto;
  }
  .directories {
    height: 300px;
  }
</style>
<template>
  <div>
    <div v-if="sshActive">
      <div v-if="sftpActive" style="position:relative">
        <Row>
          <i-col span="6">
            <div class="files-tree-list">
              <span v-html="$t('console.file_transfer.explore_files')"></span>
              <Tree class='files-tree' :data="wheel" :load-data="ls" :render="renderFileTree"
                    @on-select-change="onTreeItemSelectChange" empty-text="Nothing in this directory"></Tree>
            </div>
          </i-col>
          <i-col span="18">
            <div class="directories">
              <FileUpload :cid="sftpConId" ref="fileGridViewer"></FileUpload>
            </div>
          </i-col>
        </Row>
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
import FileUpload from '@/components/filetree/FileUpload'

const HOME = 'HOME'

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
            title: HOME,
            is_dir: true,
            path: '',
            loading: false,
            children: []
          }
        ]
    }
  },
  components: {
    FileUpload
  },
  props: {
    sshActive: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    sshActive () {
      if (!this.sshActive && this.sftpSocket) {
        this.sftpSocket.close() // todo
      }
    }
  },
  methods: {
    renderFileTree (h, { root, node, data }) {
      const _this = this
      let icon = 'android-folder'
      if (!data.is_dir) {
        icon = 'ios-filing-outline'
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
          stringFormat.format(apiRouters.params.sftp_ls, _t, this.sftpConId, true, path)), {
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
                }
              })
              // todo empty-text
              if (children.length === 0) {
                // remove expand icon.
                children.push({title: '[empty]', is_dir: false, path: ''})
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
      if (item.is_dir) { // todo
        const path = item.path
        this.$refs.fileGridViewer.onPath(path)
      }
    },
    onTreeItemSelectChange (item) {
      // console.log('item changed') // todo use onTreeItemSelectChange, but may have bug: https://github.com/iview/iview/issues/2313
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
