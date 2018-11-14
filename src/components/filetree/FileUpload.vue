<style scoped>
.file-list-container {
  height: 280px;
  background: #f8f8f9;
  padding: 10px;
  overflow-y: auto;
}
.file-list-item,
.file-uploading-list,
.file-upload-container {
  display: inline-block;
  width: 5em;
  height: 5em;
  list-style: none;
  cursor: pointer;
}
.file-list-item:hover {
  background: #e9eaec;
}
.file-list-item .file-icon {
  text-align: center;
}
.file-list-item .file-list-filename {
  display: inline-block;
  width: 4.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
<template>
  <div>
    <b><span v-text="file_grid_list.current_path_show"></span></b>
    <div class="file-list-container">
      <ul>
        <li
          class="file-list-item"
          v-for="(file_item, index) in sortedFileList"
          :key="index"
          @click="onGridFileItemClicked(file_item);"
          v-on:dblclick="onGridFileItemDoubleClicked(file_item);"
        >
          <div class="file-icon">
            <Icon
              v-if="file_item.is_dir"
              type="android-folder"
              size="32"
            ></Icon>
            <Icon v-else type="document" size="32"></Icon>
          </div>
          <span class="file-list-filename">{{ file_item.title }}</span>
        </li>
        <li
          class="file-uploading-list"
          v-for="(item, index) in uploadList"
          :key="index"
        >
          <template v-if="item.status !== 'finished'">
            <progress
              v-if="item.showProgress"
              :percent="item.percentage"
              hide-info
            ></progress>
          </template>
        </li>
        <li class="file-upload-container">
          <Upload
            ref="upload_component"
            multiple
            type="drag"
            :show-upload-list="false"
            :action="sftp_upload_action"
            :before-upload="onBeforeUpload"
            :on-progress="onUploadProgress"
            :on-success="onUploadSuccess"
            :on-error="onUploadFailed"
          >
            <div class="file-icon">
              <Icon type="android-upload" size="30"></Icon>
              <!-- style="color: #2196f3"- -->
            </div>
            <span class="file-list-filename">{{ upload_status }}</span>
          </Upload>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Config from "@/config/config";
import Utils from "@/libs/utils";
import stringFormat from "@/libs/string_format";
import apiRouters from "@/config/api_routers";

const HOME = "HOME";
const UPLOAD_STATUS_DEF = "Upload";

export default {
  data() {
    return {
      // uploadList: [],
      upload_status: UPLOAD_STATUS_DEF,
      file_uploading: false,
      file_grid_list: {
        list: [],
        current_path: "",
        current_path_show: HOME // breadcrumb
      }
    };
  },
  props: {
    cid: {
      type: String,
      default: ""
    }
  },
  watch: {
    current_path() {
      // todo clear
    }
  },
  computed: {
    sftp_upload_action() {
      const _t = sessionStorage.getItem(Config.jwt.tokenName);
      if (_t) {
        return Utils.loadUrl(
          apiRouters.router.sftp_upload,
          stringFormat.format(
            apiRouters.params.sftp_upload,
            _t,
            this.cid,
            this.file_grid_list.current_path
          )
        );
      }
      return "";
    },
    sortedFileList() {
      return this.file_grid_list.list.slice().sort((a, b) => {
        if (a.is_dir === b.is_dir) {
          return a.title === b.title ? 0 : a.title > b.title ? 1 : -1;
        } else {
          return a.is_dir ? -1 : 1;
        }
      });
    }
  },
  methods: {
    onGridFileItemClicked(fileItem) {
      if (!fileItem.is_dir) {
        const path = fileItem.path;
        const _t = sessionStorage.getItem(Config.jwt.tokenName);
        if (_t) {
          window.open(
            Utils.loadUrl(
              apiRouters.router.sftp_dl,
              stringFormat.format(apiRouters.params.sftp_dl, _t, this.cid, path)
            ),
            "_self",
            false
          );
        }
      }
    },
    onGridFileItemDoubleClicked(fileItem) {
      if (fileItem.is_dir) {
        this.onPath(fileItem.path);
      }
    },
    setGridByFilePath(children, path) {
      this.file_grid_list.list = children; // todo add time, data?
      this.file_grid_list.current_path_show = "$" + HOME + "/" + path;
      this.file_grid_list.current_path = path;
    },
    onPath(path) {
      // when the path is changed // todo add cache
      if (path && path === this.file_grid_list.current_path) {
        return; // if it is the same path.
      }
      if (this.file_uploading) {
        // if it is uploading.
        this.$Message.warning(
          this.$t("console.file_transfer.wait_for_unload_finish")
        );
        return;
      }
      const _t = sessionStorage.getItem(Config.jwt.tokenName);
      if (_t) {
        Utils.axiosInstance
          .get(
            Utils.loadUrl(
              apiRouters.router.sftp_ls,
              stringFormat.format(
                apiRouters.params.sftp_ls,
                _t,
                this.cid,
                true,
                path
              )
            ),
            {}
          )
          .then(response => {
            try {
              if (!response.data || response.data.has_error) {
                this.$Message.error(
                  this.$t("console.file_transfer.error_while_ls", { dir: path })
                ); // todo dir not shown
              } else {
                const messages = response.data.message;
                let children = [];
                messages.forEach(ele => {
                  children.push({
                    title: ele.name,
                    is_dir: ele.is_dir,
                    path: ele.path
                  }); // is_dir: maybe directory or file.
                });
                this.setGridByFilePath(children, path);
              }
            } catch (e) {
              this.$Message.error(
                this.$t("console.file_transfer.error_while_ls", { dir: path })
              );
            }
          });
      }
    },
    onBeforeUpload() {
      // if it is uploading.
      if (this.file_uploading) {
        this.$Message.warning(
          this.$t("console.file_transfer.wait_for_unload_finish")
        );
        return false;
      }
      this.file_uploading = true;
      return true;
    },
    onUploadProgress(event) {
      // console.log(event.percent)
      let per = event.percent.toFixed(1);
      if (per >= 100) {
        this.upload_status = this.$t(
          "console.file_transfer.upload_status_pending"
        );
      } else {
        this.upload_status = this.$t(
          "console.file_transfer.upload_status_uploading",
          { percent: event.percent.toFixed(1) }
        );
      }
    },
    onUploadSuccess(res, file) {
      this.upload_status = this.$t("console.file_transfer.upload_status_def");
      this.file_uploading = false;
      this.file_grid_list.list.push({
        title: file.name,
        is_dir: false,
        path: this.file_grid_list.current_path + "/" + file.name
      });
      // todo upload directory? // todo make sure the same file name.
      // todo file may exist in list?
      // todo read filename from http response
    },
    onUploadFailed() {
      this.upload_status = this.$t("console.file_transfer.upload_status_def");
      this.file_uploading = false;
      this.$Message.error(this.$t("console.file_transfer.upload_status_fail"));
    }
  },
  mounted() {
    this.upload_status = this.$t("console.file_transfer.upload_status_def");
    // this.uploadList = this.$refs.upload_component.fileList
  }
};
</script>
