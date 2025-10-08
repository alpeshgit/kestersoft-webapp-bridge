let apiClient = null

export const getApiClient = function(){
    return apiClient?.apply(null,arguments)
}

export const setApiClient = (client) => {
    apiClient = client
}

export default getApiClient