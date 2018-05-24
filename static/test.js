"use strict";

var account = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.avatar = obj.avatar;
        this.twNum = obj.twNum;
        if (this.twNum == null) {
            this.twNum = 0;
        }
    } else {
        this.name = "";
        this.avatar = "";
        this.twNum = 0;
    }
};

account.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var account_name = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.avatar = obj.avatar;
    } else {
        this.address = "";
        this.avatar = "";
    }
}

var twitter = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.value = obj.value;
        this.time = obj.time;
        this.cmtNum = obj.cmtNum;
        if (this.cmtNum == null) {
            this.cmtNum = 0;
        }
    } else {
        this.value = "";
        this.time = "";
        this.cmtNum = 0;
    }
}

twitter.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var comment = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.twid = obj.twid;
        this.nickName = obj.nickName;
        this.value = obj.value;
        this.time = obj.time;
    } else {
        this.from = "";
        this.twid = "";
        this.nickName = "";
        this.value = "";
        this.time = "";
    }
}

comment.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var allAction = function () {

};

allAction.prototype = {
    init: function () {

    },
    register: function (text) {
        var acc = new account(text);
        var from = Blockchain.transaction.from;
        var user = LocalContractStorage.get(from);
        acc.name = acc.name.trim();
        var name = acc.name;
        if (name.length() < 1) {
            throw new Error("Empty Name!");
        }
        if (name.indexOf("@") > -1 || name.indexOf("#")) {
            throw  new Error("Name contains '@#'!");
        }
        if (name.length > 50) {
            throw new Error("Name's max length is 50!");
        }
        if (user != null) {
            var exAcc = new account(user);
            LocalContractStorage.del(exAcc.name);
            exAcc.name = acc.name;
            acc = exAcc;
        }

        user = LocalContractStorage.get("n__" + name);
        if (user != null) {
            throw new Error("Existed Name!");
        }

        LocalContractStorage.set(from, acc.toString());
        var accN = new account_name();
        accN.address = from;
        accN.avatar = acc.avatar;
        LocalContractStorage.set("n__" + name, accN.toString());
    },
    post_twitter: function (text) {
        var tw = new twitter(text);
        var from = Blockchain.transaction.from;
        var userStr = LocalContractStorage.get(from);
        if (userStr == null || userStr == '') {
            throw new Error("Please register!");
        }
        var user = new account(userStr);
        var index = user.twNum;
        LocalContractStorage.set(from + "_" + index, text);
        user.twNum = index + 1;
        LocalContractStorage.set(from, user.toString())
    },
    comment_twitter : function (text) {
        var comment = new comment(text);
        var from = Blockchain.transaction.from;
        comment.from = from;
        var userStr = LocalContractStorage.get(from);
        if (userStr == null || userStr == '') {
            throw new Error("Please register!");
        }
        var user = new account(userStr);
        comment.nickName = user.name;
        var tw = LocalContractStorage.get(comment.twid);
        if (tw != null) {
            var twO = new twitter(tw);
            var index = twO.cmtNum;
            LocalContractStorage.set(comment.twid + "_" + index, text);
            twO.cmtNum = index + 1;
            LocalContractStorage.set(comment.twid, twO.toString());
        }
    },
    list_tw: function (id) {
        var userStr = LocalContractStorage.get(id);
        if (userStr == null || userStr == '') {
            throw new Error("User doesn't exist!");
        }
        var user = new account(userStr);
        var ind = user.twNum;
        var ret = [];
        for (var i=0;i<ind;i++)
        {
            ret.push(LocalContractStorage.get(id + "_" + i))
        }
        return ret;
    },
    list_cmt: function (id) {
        var twStr = LocalContractStorage.get(id);
        if (twStr == null || twStr == '') {
            throw new Error("User doesn't exist!");
        }
        var tw = new twitter(twStr);
        var ind = tw.cmtNum;
        var ret = [];
        for (var i=0;i<ind;i++)
        {
            ret.push(LocalContractStorage.get(id + "_" + i))
        }
        return ret;
    }

}

module.exports = allAction;