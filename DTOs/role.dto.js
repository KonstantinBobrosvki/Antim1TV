module.exports = class RoleDTO {
    constructor(role) {
        this.id = role.id;
        this.tag = role.tag;
        this.priority = role.priority;
        this.mutable = role.mutable;
    }
}