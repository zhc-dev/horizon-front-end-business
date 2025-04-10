import service from '@/utils/request'

export function getContestListService(params) {
    return service({
        url: "/contest/list",
        method: "get",
        params,
    })
}

export function contestAddService(params = {}) {
    return service({
        url: "/contest/add",
        method: "post",
        data: params,
    });
}

export function addContestQuestionService(params = {}) {
    return service({
        url: "/contest/question/add",
        method: "post",
        data: params,
    });
}

export function getContestDetailService(contestId) {
    return service({
        url: "/contest/detail",
        method: "get",
        params: { contestId },
    });
}

export function editContestService(params = {}) {
    return service({
        url: "/contest/edit",
        method: "put",
        data: params,
    });
}

export function delContestQuestionService(contestId, questionId) {
    return service({
        url: "/contest/question/delete",
        method: "delete",
        params: { contestId, questionId },
    });
}

export function delContestService(contestId) {
    return service({
        url: "/contest/delete",
        method: "delete",
        params: { contestId },
    });
}

export function publishContestService(contestId) {
    return service({
        url: "/contest/publish",
        method: "put",
        params: { contestId },
    });
}

export function cancelPublishContestService(contestId) {
    return service({
        url: "/contest/cancelPublish",
        method: "put",
        params: { contestId },
    });
}