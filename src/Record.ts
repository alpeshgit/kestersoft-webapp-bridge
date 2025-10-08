export default class Record {

    #entity

    constructor(entity,value){
        this.#entity = entity
        this.original = value
        this.discard()
    }

    // TODO: implement mergePatch method

    set(path,value){
       
        if (typeof path !== 'string') {
            return false
        }
        path = path.split('.')

        let current = this.value
        for (let i = 0; i < path.length; i++) {
            const key = path[i]

            // if we're at the last part of the path → set value
            if (i === path.length - 1) {
                current[key] = value
            } else {
                // if next key looks like an array index
                const nextKey = path[i + 1]
                const isArrayIndex = !isNaN(Number(nextKey))

                if (!(key in current)) {
                    current[key] = isArrayIndex ? [] : {}
                }

                current = current[key]
            }
        }
        return true
    }

    discard(){
        this.value = structuredClone(this.original)
    }

    refresh(retainEdits=false){
        if(this.original._id){
            // TODO: implement
            this.#entity.query(this.original._id)
            if(retainEdits){
                this.discard()
            }
            return false
        }
        return true
    }

    async save(){
        if(this.original?._id){
            // update
            if(this.#entity.canUpdate_s){
                // TODO: evaluate criteria
                // TODO: fetch updated result & merge
                const response = this.#entity.updateApi(this.value)
                return response
            } else {
                throw new Error("Unauthorized, Edit not allowed")
            }
        } else {
            // create
            if(this.#entity.canCreate_s){
                // TODO: evaluate criteria
                const response = await this.#entity.createApi(this.value)
                this.original._id = response.result.insertedId
                this.discard()
                return response
            } else {
                throw new Error("Unauthorized, Create not allowed")
            }
        }
    }
}