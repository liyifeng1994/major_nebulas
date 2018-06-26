"use strict";

var MajorItem = function(_id, from, tag, content, pubTime) {
    this._id = _id;
    this.from = from;
    this.tag = tag;
    this.content = content;
    this.pubTime = pubTime;
};

MajorItem.prototype.toString = function() {
    return JSON.stringify(this);
};

var MajorContract = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

MajorContract.prototype = {
    init: function() {
        this.size = 0;
    },
    set: function(from, tag, content, pubTime) {
        var value = new MajorItem(this.size, from, tag, content, pubTime);
        var index = this.size;
        this.dataMap.set(index, value);
        this.size += 1;
    },
    get: function(index) {
        return this.dataMap.get(index);
    },
    len: function() {
        return this.size;
    },
    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var val = this.dataMap.get(i);
            val && result.push(val);
        }
        return result;
    },
    getAll: function() {
        return this.forEach(this.size, 0);
    },
    getByTag: function(tag) {
        var result = [];
        var data = this.forEach(this.size, 0);
        for (var val in data) {
            if (data[i].tag === tag) {
                result.push(val);
            }
        }
        return result;
    },
    del: function(index) {
        return this.dataMap.del(index);
    }
};

module.exports = MajorContract;