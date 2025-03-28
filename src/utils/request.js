import axios from 'axios'

const service = axios.create({
    baseURL: '/dev-api',
    timeout: 5000 // 5s
})

export default service