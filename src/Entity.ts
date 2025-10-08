import ApiClient from "./ApiClient"
import Record from "./Record"

export default class Entity {

    query
    create
    queryApi
    createApi
    updateApi
    name

    constructor(profileEntity){
        this.name = profileEntity.name_s
        this.canCreate_s = profileEntity.canCreate_s
        this.canRead_s = profileEntity.canRead_s
        this.canUpdate_s = profileEntity.canUpdate_s
        this.canDelete_s = profileEntity.canDelete_s
        this.accessibleFields_s = profileEntity.accessibleFields_s

        // TODO: set field schema
        // TODO: set criterias for create, read, update, delete

        // TODO: support adhoc query and options like sorting, limit, offset
        this.queryApi = this.canRead_s ? (query) => ApiClient({
            entity: this.name,
            operation: "queryApi",
            argument: query
        }) : null

        // TODO: support adhoc query and options like sorting, limit, offset
        this.createApi = this.canCreate_s ? (recordData) => ApiClient({
            entity: this.name,
            operation: "createApi",
            argument: recordData
        }) : null

        // TODO: support adhoc query 
        this.updateApi = this.canUpdate_s ? (recordData) => ApiClient({
            entity: this.name,
            operation: "updateApi",
            argument: recordData
        }) : null

        this.query = this.canRead_s ? async (query) => {
            const result = await this.queryApi(query)
            return new Record(this,result.record)
        } : null
        this.create = this.canCreate_s ? async (recordData=null) => {
            const value = recordData ? structuredClone(recordData) : {}
            delete value._id
            return new Record(this,value)
        } : null
    }
}