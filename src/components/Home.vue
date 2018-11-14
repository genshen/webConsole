<style scoped>
.index {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: center;
}

.main-content {
  height: calc(100% - 6em);
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: center;
}
.main-content .ivu-row-flex {
  height: 100%;
}
</style>

<template>
  <div class="index footer-container">
    <div class="pre-footer-content">
      <div class="main-content">
        <Row type="flex" justify="center" align="middle">
          <i-col span="24">
            <h1><img src="@/assets/ssh.png" /></h1>
            <h2>
              <p>{{ $t("index.welcome") }}!</p>
              <br />
              <i-button @click="toSignIn" type="primary">
                {{ $t("index.goto_signin") }}
              </i-button>
            </h2>
          </i-col>
        </Row>
      </div>
    </div>
    <FooterBar></FooterBar>
  </div>
</template>

<script>
import FooterBar from "./Footer.vue";

export default {
  components: {
    FooterBar
  },
  methods: {
    toSignIn() {
      this.$router.push({ name: "signin" });
    }
  }
};
</script>
