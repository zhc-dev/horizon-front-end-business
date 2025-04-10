import service from "@/utils/request";

export function getLanguageList() {
    return service({
        url: "/language/list",
        method: "get"
    });
}