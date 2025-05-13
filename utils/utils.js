exports.formatDollars = (number) => {
    return number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
};

exports.formatDate = (date) => {
    const longDate = new Intl.DateTimeFormat(undefined, {dateStyle: "long"});
    return longDate.format(new Date(date));
}

exports.formatShortDate = (date) => {
    const nd = new Date(date);
    return nd.toISOString().slice(0, 10)
}