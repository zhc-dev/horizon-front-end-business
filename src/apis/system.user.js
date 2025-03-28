import service from "@/utils/request";

export function loginService(userAccount, userPassword) {
    return service({
        url: '/system/user/login',
        method: 'post',
        data: { userAccount, userPassword }
    })
}