import service from '@/utils/request'

export function getUserListService(params) {
  return service({
    url: "/user/list",
    method: "get",
    params,
  });
}

export function updateStatusService(params = {}) {
  return service({
    url: "/user/update-status",
    method: "put",
    data: params,
  });
}