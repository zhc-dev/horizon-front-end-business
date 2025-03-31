import service from "@/utils/request";

export function loginService(userAccount, userPassword) {
    return service({
        url: '/system/user/login',
        method: 'post',
        data: { userAccount, userPassword }
    })
}

export function currentUserService() {
    return service({
        url: '/system/user/current',
        method: 'get',
    })
}

export function logoutService() {
    return service({
        url: '/system/user/logout',
        method: 'delete',
    })
}