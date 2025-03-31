import axios from 'axios'
import { getToken } from '@/utils/cookie';
import { removeToken } from '@/utils/cookie';
import router from '@/router';
const service = axios.create({
    baseURL: '/dev-api',
    timeout: 5000
})


//请求拦截器
service.interceptors.request.use(
    (config) => {
        if (getToken()) {
            config.headers["Authorization"] = "Bearer " + getToken();
        }
        return config;
    },
    (error) => {
        console.log(error)
        Promise.reject(error);
    }
);

//响应拦截器
service.interceptors.response.use(
    (res) => {
        const code = res.data.code;
        const msg = res.data.msg;
        if (code === 3001) {
            // ElMessage.error(msg);
            removeToken()
            router.push('/system/login')
            return Promise.reject(new Error(msg));
        } else if (code !== 1000) {
            ElMessage.error(msg);
            return Promise.reject(new Error(msg));
        } else {
            return Promise.resolve(res.data);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default service