var API = {
    key:    '＊請於 http://www.plurk.com/API 取得 API Key 並填入＊',
    timeout: 10000,
    __cookie: null,
    __ajaxParams: null,
    __lastXHR:  null,

    onBeforeSend: null,
    onComplete: null,

    __get:  function ( api, param ) {
        var protocol = 'http';
        if( param.ssl ) {
            protocol = 'https';
        }
        return protocol + '://www.plurk.com/API' + api + '/';
    },
    call:   function ( api, param, callback, onError ) {
        param.api_key = this.key;
        this.__ajaxParams.success   = callback;
        this.__ajaxParams.data      = param;
        this.__ajaxParams.url       = this.__get(api, param);
        if( onError )
            this.__ajaxParams.error = onError;
        $.ajax(this.__ajaxParams);
    },
    __setupAJAX: function (  ) {
        var params = {
            dataType:   'json',
            timeout:    this.timeout,
            cache:      false,
            type:       'POST',
        };
        params.beforeSend = function ( xhr ) {
            /*
            if( document.cookie )
                xhr.setRequestHeader('cookie', document.cookie);
            */
            if( API.__cookie )
                xhr.setRequestHeader('cookie', API.__cookie);
            if( API.onBeforeSend && API.onBeforeSend.call )
                API.onBeforeSend(xhr);
        };
        params.complete = function ( xhr, textStatus ) {
            var setCookie = xhr.getResponseHeader('Set-Cookie');
            if( setCookie )
                // document.cookie = setCookie;
                API.__cookie = setCookie;
            if( API.onComplete && API.onComplete.call )
                API.onComplete(xhr, textStatus);
            API.__lastXHR = xhr;
        };
        this.__ajaxParams = params;
    },
    init:   function (  ) {
        this.__setupAJAX();
        delete this.init;
        delete this.__setupAJAX;
        return this;
    },
    getDisplayName: function ( u ) {
        return u.displayname || u.nick_name;
    },
    getQualifier:   function ( p ) {
        return p.qualifier_translated || p.qualifier;
    },
    dateString: function ( d ) {
        // TODO: Refactor
        function pad(n) {
            return n < 10 ? '0' + n : n
        }
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
    },
}.init();
