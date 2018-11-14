<style>
.footer-container {
  height: 100%;
}

.footer-container .pre-footer-content {
  min-height: 100%;
  margin-bottom: -6em;
}

.footer-container footer {
  height: 6em;
  color: #9ea7b4;
  background: #f5f7f9;
  text-align: center;
  padding: 8px;
}
</style>

<template>
  <footer>
    <div class="footer">
      <router-link :to="{ name: 'home' }">
        &nbsp;{{ $t("global.home") }}&nbsp;
      </router-link>
      <span>|</span>
      <Icon size="18" type="social-github"></Icon>
      <a href="https://github.com/genshen/sshWebConsole" target="_blank">
        &nbsp;Github&nbsp;
      </a>
      <span>|</span>
      <i-button @click="switchLang" type="ghost" size="small">
        {{ $t("global.switch_lang") }}
      </i-button>
    </div>
  </footer>
</template>

<script>
export default {
  methods: {
    switchLang() {
      if (this.$i18n.locale === "zh") {
        this.$i18n.locale = "en";
        localStorage.setItem("language", "en");
      } else if (this.$i18n.locale === "en") {
        this.$i18n.locale = "zh";
        localStorage.setItem("language", "zh");
      }
    }
  }
};
</script>

<!--
  -
  to use footer component:

  <template>
      <div class="signin footer-container">
          <div class="pre-footer-content"> Content </div>
          <FooterBar></FooterBar>
      </div>
  <template>

  <script>
  import FooterBar from './Footer.vue';
  export default {
      components: {
          FooterBar
      }
  };
  </script>

  Besides,all parent elements should add "height:100%" style.
-->
