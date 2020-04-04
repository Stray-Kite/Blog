var formate = function formateDate(time) {
    var year = time.getFullYear();
    var month = time.getMonth() + 1 > 10 ? time.getMonth() : '0' + (time.getMonth() + 1);
    var date = time.getDate() > 10 ? time.getDate() : '0' + time.getDate();
    return year + '-' + month + '-' + date;
};

module.exports = formate;
