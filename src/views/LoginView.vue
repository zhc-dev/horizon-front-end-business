<template>
    <div class="login-page">
        <div class="orange"> </div>
        <div class="blue"></div>
        <div class="blue small"></div>
        <div class="login-box">
            <div class="logo-box">
                <div class="right">
                    <div class="sys-name">Horizon 后台管理</div>
                    <div class="sys-sub-name">{{ currentSlogan }}</div>
                </div>
            </div>
            <div @keyup.enter="login" class="form-box">
                <div class="form-item">
                    <img src="../assets/images/phone.png">
                    <el-input v-model="userAccount" placeholder="请输⼊账号" />
                </div>
                <div class="form-item">
                    <img src="../assets/images/captcha.png">
                    <el-input v-model="userPassword" show-password placeholder="请输⼊密码" />
                </div>
                <div @click="login" class="submit-box">
                    登录
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { loginService } from '@/apis/system.user';
import router from '@/router';
import { setToken } from '@/utils/cookie';
import { ElMessage } from 'element-plus';

const slogans = [
    "while(true) { 稳定运行 }",
    "Ctrl + S 你的管理焦虑",
    "404管理烦恼 Not Found",
    "// 注释掉所有低效操作",
    "Warning: 快乐管理正在覆盖系统",
    "Segmentation Fault → 管理故障清零",
    "git commit -m '修复你的焦虑'",
    "Warning: 管理员权限过载",
    "输入密码——或尝试 rm -rf /*",
    "Debug管理？先设个断点喝杯咖啡",
    "验证身份中... (别想sudo混入)",
    "验证身份中... (别想NaN混入)"
]

const currentSlogan = ref("Welcome, Admin! ")
const previousIndex = ref(-1)
const interval = setInterval(() => {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * slogans.length);
    } while (randomIndex === previousIndex.value); // 确保不重复

    currentSlogan.value = slogans[randomIndex];
    previousIndex.value = randomIndex;
}, 2000)

onBeforeUnmount(() => {
    clearInterval(interval);
})

const userAccount = ref('')
const userPassword = ref('')

const login = async () => {
    try {
        const response = await loginService(userAccount.value, userPassword.value)
        console.log('login response', response)
        router.push('/system/user')
        setToken(response.data.token)
    } catch (error) {
        console.log("error:", error)
    }
}
</script>
<style lang="scss" scoped>
.login-page {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;

    .login-box {
        overflow: hidden;

        .logo-box {
            display: flex;
            align-items: center;
            margin-bottom: 30px;

            img {
                width: 68px;
                height: 68px;
                margin-right: 16px;
            }

            .sys-name {
                height: 33px;
                font-family: PingFangSC, PingFang SC;
                font-weight: 600;
                font-size: 24px;
                color: #222222;
                line-height: 33px;
                margin-bottom: 13px;
            }

            .sys-sub-name {
                font-family: 'CedarvilleCursive-Regular', cursive, PingFangSC, sans-serif;
                font-size: 17px;
                color: #222222;
                transition: opacity 0.3s ease;
                backface-visibility: hidden;
                height: 22px;
                font-weight: 400;
                line-height: 22px;
            }
        }

        :deep(.form-box) {
            .submit-box {
                margin-top: 90px;
                width: 456px;
                height: 48px;
                background: #32C5FF;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: PingFangSC, PingFang SC;
                font-weight: 600;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 1px;
            }

            .form-item {
                display: flex;
                align-items: center;
                width: 456px;
                height: 48px;
                background: #F8F8F8;
                border-radius: 8px;
                margin-bottom: 30px;
                position: relative;

                .code-btn-box {
                    position: absolute;
                    right: 0;
                    width: 151px;
                    height: 48px;
                    background: #32C5FF;
                    border-radius: 8px;
                    top: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;

                    span {
                        font-family: PingFangSC, PingFang SC;
                        font-weight: 400;
                        font-size: 16px;
                        color: #FFFFFF;
                    }
                }

                .error-tip {
                    position: absolute;
                    width: 140px;
                    text-align: right;
                    padding-right: 12px;
                    height: 20px;
                    font-family: PingFangSC, PingFang SC;
                    font-weight: 400;
                    font-size: 14px;
                    color: #FD4C40;
                    line-height: 20px;
                    right: 0;

                    &.bottom {
                        right: 157px;
                    }
                }

                .el-input {
                    width: 380px;
                    font-family: PingFangSC, PingFang SC;
                    font-weight: 400;
                    font-size: 16px;
                    color: #222222;
                }

                .el-input__wrapper {
                    border: none;
                    box-shadow: none;
                    background: transparent;
                    width: 230px;
                    padding-left: 0;
                }

                img {
                    width: 24px;
                    height: 24px;
                    margin: 0 18px;
                }
            }
        }

        width:456px;
        height:404px;
        background: #FFFFFF;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        opacity: 0.9;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        padding: 0 72px;
        padding-top: 50px;
    }

    &::after {
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        bottom: 0;
        right: 0;
        background: rgba(255, 255, 255, .8);
        z-index: 1;
        content: '';
    }

    .orange {
        background: #F0714A;
        width: 498px;
        height: 498px;
        border-radius: 50%;
        background: #F0714A;
        opacity: 0.67;
        filter: blur(50px);
        left: 14.2%;
        top: 41%;
        position: absolute;
    }

    .blue {
        width: 334px;
        height: 334px;
        background: #32C5FF;
        opacity: 0.67;
        filter: blur(50px);
        left: 14.2%;
        top: 42%;
        position: absolute;
        top: 16.3%;
        left: 80.7%;

        &.small {
            width: 186px;
            height: 186px;
            top: 8.2%;
            left: 58.2%;
        }
    }
}

@font-face {
    font-family: 'CedarvilleCursive-Regular';
    src: url('../assets/fonts/CedarvilleCursive-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}
</style>