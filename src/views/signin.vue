<style scoped>
.signin {
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    text-align: center;
}

.signin .ivu-row-flex {
    height: 100%;
}
</style>
<template>
    <div class="signin footer-container">
        <Row class="pre-footer-content" type="flex" justify="center" align="middle">
            <Col :xs="22" :sm="12" :md="8" :lg="6">
            <h1> {{ $t('signin.form_title') }}</h1>
            <Form ref="formValue" :model="formValue" :rules="formRule">
                <Form-item prop="fullHost">
                    <Input type="text" v-model="formValue.fullHost" :placeholder="$t('signin.form_fullhost_ph')">
                    <span slot="prepend">{{ $t('signin.form_fullhost_prepend') }}</span>
                    </Input>
                </Form-item>
                <Form-item prop="username">
                    <Input type="text" v-model="formValue.username" :placeholder="$t('signin.form_username_ph')">
                    <Icon type="ios-person" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item prop="password">
                    <Input type="password" v-model="formValue.password" :placeholder="$t('signin.form_passwd_ph')">
                    <Icon type="ios-locked" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item>
                    <Button type="success" :loading="submitLoading" @click="handleSubmit('formValue')" long>
                        <template v-if="!submitLoading">
                            <Icon type="paper-airplane"></Icon>&emsp;{{ $t("signin.form_submit_btn") }}
                        </template>
                        <template v-else>
                            {{ $t("signin.form_submit_btn_loading") }}
                        </template>
                    </Button>
                </Form-item>
            </Form>
            </Col>
        </Row>
        <Footers></Footers>
    </div>
</template>

<script>
import Footers from './footer.vue';
import Cookies from 'js-cookie';
import Util from '../libs/util';

export default {
    components: {
        Footers
    },
    data() {
        const validateHost = (rule, value, callback) => {
            let list = value.split(':');
            if (list.length === 1) {
                callback();
            } else if (list.length === 2 && !isNaN(list[1])) {
                callback();
            } else {
                callback(new Error(this.$t('signin.form_fullhost_error')));
            }
        };
        return {
            submitLoading: false,
            formValue: {
                fullHost: '',
                username: '',
                password: ''
            },
            formRule: {
                fullHost: [
                    { required: true, message: this.$t('signin.form_fullhost_required'), trigger: 'blur' },
                    { validator: validateHost, trigger: 'blur' }
                ],
                username: [
                    { required: true, message: this.$t('signin.form_username_required'), trigger: 'blur' }
                ],
                password: []
            }
        }
    },
    created() {
        if (window.localStorage.getItem('user.host')) {
            this.formValue.fullHost = window.localStorage.getItem('user.host');
        }
        if (window.localStorage.getItem('user.username')) {
            this.formValue.username = window.localStorage.getItem('user.username');
        }
    },
    methods: {
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    let hostList = this.formValue.fullHost.split(':');
                    let host = hostList[0];
                    let port = 22;
                    if (hostList.length === 2) {
                        port = parseInt(hostList[1]);
                    }
                    // let xsrf = Cookies.get('_xsrf');
                    // if (xsrf) {
                    this.$Loading.start();
                    this.submitLoading = true;
                    let self = this;
                    Util.axiosInstance.post(Util.loadUrl('/signin'), {
                        // _xsrf: Util.base64Decode(xsrf.split("|")[0]), //todo
                        host: host,
                        port: port,
                        username: this.formValue.username,
                        passwd: this.formValue.password,
                    }).then(function (response) {
                        try {
                            if (response.data.has_error) {
                                self.$Loading.error();
                                switch (response.data.message) {
                                    case 0:
                                        self.$Message.error(self.$t('signin.form_has_error'));
                                        break;
                                    case 1:
                                        self.$Message.error(self.$t('signin.form_error_passport'));
                                        break;
                                    case 2:
                                        self.$Message.error(self.$t('signin.form_error_test'));
                                        break;
                                }
                            } else {
                                self.$Loading.finish();
                                self.$Message.success(self.$t('signin.signin_success'));
                                window.localStorage.setItem('user.host', self.formValue.fullHost);
                                window.localStorage.setItem('user.username', self.formValue.username);
                                self.$router.push({ name: 'console' });
                            }
                        } catch (e) {
                            self.$Loading.error();
                        }
                        self.submitLoading = false;
                    }).catch(function (error) {
                        self.$Loading.error();
                        self.submitLoading = false;
                    });
                    // } else {
                    //     this.$Message.error(this.$t('global.error_happened_try_refresh'));
                    // }
                } else {
                    this.$Message.error(this.$t('signin.form_has_error'));
                }
            })
        }
    }
};
</script>