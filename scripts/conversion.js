/* jslint browser: true */
function convertToPercent(pixel) {
    var body = document.body,
		html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    
    return ((pixel / height) * 100);
}

function convertToPixel(percent) {
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    
    return ((percent * height) / 100);
}